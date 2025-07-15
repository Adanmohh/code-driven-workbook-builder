from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional, List
import os
import io
import json
from dotenv import load_dotenv
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock
from pdfminer.high_level import extract_text
from PIL import Image
import pytesseract
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import tempfile
import base64

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Claude Code SDK doesn't require API key setup - it uses local Claude Code CLI

class GenerateRequest(BaseModel):
    file_content: str
    file_type: str

class RewritePageRequest(BaseModel):
    page_index: int
    code: str
    instruction: str

class RewriteGlobalRequest(BaseModel):
    code: str
    instruction: str

class BrandRequest(BaseModel):
    primary_color: str
    secondary_color: str
    accent_color: str
    font_primary: str
    font_secondary: str
    logo_url: Optional[str] = None

class ExportPDFRequest(BaseModel):
    pages: List[dict]
    brandKit: dict

class ExecuteCodeRequest(BaseModel):
    code: str
    language: str = "javascript"

async def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        return extract_text(io.BytesIO(file_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

async def extract_text_from_image(file_content: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(file_content))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from image: {str(e)}")

@app.post("/api/generate")
async def generate_workbook(file: UploadFile = File(...)):
    content = await file.read()
    file_type = file.filename.split('.')[-1].lower()
    
    # Extract text based on file type
    if file_type == 'pdf':
        text_content = await extract_text_from_pdf(content)
    elif file_type in ['png', 'jpg', 'jpeg']:
        text_content = await extract_text_from_image(content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Generate workbook code using Claude Code SDK
    prompt = f"""
    Create a paginated React workbook component from the following content.
    Each page should be a separate component with proper styling.
    Use Tailwind CSS classes for styling.
    The workbook should be editable and print-ready.
    Return an array of page components with their code.
    
    Content:
    {text_content[:5000]}  # Limit content for initial processing
    
    Return a JSON structure with:
    {{
        "pages": [
            {{
                "index": 0,
                "title": "Page Title",
                "code": "React component code here"
            }}
        ]
    }}
    """
    
    try:
        options = ClaudeCodeOptions(
            system_prompt="You are an expert React developer specializing in creating educational workbooks. Always return valid JSON.",
            max_turns=1
        )
        
        response_text = ""
        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        response_text += block.text
        
        # Parse the response and extract JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            workbook_data = json.loads(json_match.group())
            return workbook_data
        else:
            raise ValueError("No valid JSON found in response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating workbook: {str(e)}")

@app.post("/api/rewrite_page")
async def rewrite_page(request: RewritePageRequest):
    prompt = f"""
    Rewrite the following React component code for a workbook page based on the instruction.
    Keep the same structure but apply the requested changes.
    
    Current code:
    {request.code}
    
    Instruction:
    {request.instruction}
    
    Return only the updated React component code.
    """
    
    try:
        options = ClaudeCodeOptions(
            system_prompt="You are an expert React developer. Return only the updated React component code.",
            max_turns=1
        )
        
        response_text = ""
        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        response_text += block.text
        
        return {"code": response_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rewriting page: {str(e)}")

@app.post("/api/rewrite_global")
async def rewrite_global(request: RewriteGlobalRequest):
    prompt = f"""
    Apply the following instruction across all pages of the workbook.
    Return a diff or updated code for each affected page.
    
    Current workbook code:
    {request.code}
    
    Instruction:
    {request.instruction}
    
    Return a JSON structure with changes for each page.
    """
    
    try:
        options = ClaudeCodeOptions(
            system_prompt="You are an expert React developer. Return a JSON structure with changes for each page.",
            max_turns=1
        )
        
        response_text = ""
        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        response_text += block.text
        
        # Parse and return the response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            changes_data = json.loads(json_match.group())
            return changes_data
        else:
            return {"changes": response_text}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying global changes: {str(e)}")

@app.post("/api/brand")
async def generate_brand_styles(request: BrandRequest):
    brand_css = f"""
    :root {{
        --color-primary: {request.primary_color};
        --color-secondary: {request.secondary_color};
        --color-accent: {request.accent_color};
        --font-primary: {request.font_primary};
        --font-secondary: {request.font_secondary};
    }}
    """
    
    return {"css": brand_css}

@app.post("/api/export-pdf")
async def export_pdf(request: ExportPDFRequest):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            # Generate HTML content for all pages
            html_content = generate_workbook_html(request.pages, request.brandKit)
            
            # Set the content and generate PDF
            await page.set_content(html_content, wait_until='networkidle')
            
            pdf_bytes = await page.pdf(
                format='A4',
                print_background=True,
                margin={
                    'top': '1in',
                    'right': '1in',
                    'bottom': '1in',
                    'left': '1in'
                }
            )
            
            await browser.close()
            
            return Response(
                content=pdf_bytes,
                media_type='application/pdf',
                headers={'Content-Disposition': 'attachment; filename=workbook.pdf'}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

def generate_workbook_html(pages: List[dict], brand_kit: dict) -> str:
    brand_css = f"""
    :root {{
        --color-primary: {brand_kit.get('primaryColor', '#3b82f6')};
        --color-secondary: {brand_kit.get('secondaryColor', '#8b5cf6')};
        --color-accent: {brand_kit.get('accentColor', '#10b981')};
        --font-primary: '{brand_kit.get('fontPrimary', 'Inter')}', sans-serif;
        --font-secondary: '{brand_kit.get('fontSecondary', 'Roboto')}', sans-serif;
    }}
    """
    
    pages_html = ""
    for i, page in enumerate(pages):
        page_break = "page-break-before: always;" if i > 0 else ""
        pages_html += f"""
        <div style="{page_break} min-height: 100vh; padding: 2rem;">
            <div class="page-content">
                {page.get('code', '')}
            </div>
        </div>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            {brand_css}
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: var(--font-primary);
                color: var(--color-text, #1f2937);
                background-color: var(--color-background, #ffffff);
            }}
            @media print {{
                body {{
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }}
            }}
        </style>
    </head>
    <body>
        {pages_html}
    </body>
    </html>
    """
    
    return html

@app.post("/api/execute-code")
async def execute_code(request: ExecuteCodeRequest):
    try:
        # Check if E2B API key is available
        e2b_api_key = os.getenv("E2B_API_KEY")
        if not e2b_api_key:
            return {"error": "E2B sandbox not configured", "output": "Sandbox execution not available"}
        
        # Import E2B (only if needed)
        try:
            from e2b import CodeInterpreter
        except ImportError:
            return {"error": "E2B not installed", "output": "Please install E2B: pip install e2b"}
        
        # Execute code in E2B sandbox
        with CodeInterpreter(api_key=e2b_api_key) as e2b:
            # Set timeout for execution
            execution = e2b.run_code(request.code, timeout=30)
            
            output = ""
            if execution.stdout:
                output += f"Output:\n{execution.stdout}\n"
            if execution.stderr:
                output += f"Error:\n{execution.stderr}\n"
            
            return {
                "output": output or "Code executed successfully (no output)",
                "success": not execution.stderr
            }
            
    except Exception as e:
        return {
            "error": str(e),
            "output": f"Execution failed: {str(e)}",
            "success": False
        }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)