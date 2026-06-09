from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import re

def create_pdf_from_text(input_file, output_file, title):
    """Convert structured text to PDF"""
    
    # Create custom styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=26,
        textColor=HexColor('#2c5282'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#4a5568'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    doc_header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=HexColor('#ffffff'),
        backColor=HexColor('#2c5282'),
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold',
        leftIndent=10,
        rightIndent=10
    )
    
    section_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=HexColor('#1a202c'),
        spaceAfter=6,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#2d3748'),
        spaceAfter=6,
        fontName='Times-Roman'
    )
    
    contact_style = ParagraphStyle(
        'ContactStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=HexColor('#4a5568'),
        alignment=TA_RIGHT,
        fontName='Times-Italic',
        spaceBefore=8
    )
    
    # Create PDF
    pdf_doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        leftMargin=15*mm,
        rightMargin=15*mm,
        topMargin=18*mm,
        bottomMargin=18*mm
    )
    
    story = []
    
    # Add title page
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Generated Dataset - {input_file}", subtitle_style))
    story.append(Spacer(1, 10))
    
    # Read input file
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by document separator
    documents = content.strip().split('***')
    
    print(f"Processing {len(documents)} documents...")
    
    for idx, doc_text in enumerate(documents, 1):
        if idx % 50 == 0:
            print(f"  Processed {idx} documents...")
        
        doc_text = doc_text.strip()
        if not doc_text:
            continue
        
        lines = doc_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Document headers
            if line.startswith('**Document Type:**') or line.startswith('**Notice Number:**') or line.startswith('**Circular Number:**'):
                val = re.sub(r'\*\*.*?:\*\*', '', line).strip()
                story.append(Spacer(1, 10))
                story.append(Paragraph(val, doc_header_style))
            
            # Bold fields
            elif line.startswith('**') and ':**' in line:
                val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
                story.append(Paragraph(val, normal_style))
            
            # Contact info
            elif 'Contact' in line and ('@' in line or '+91' in line):
                val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
                story.append(Paragraph(val, contact_style))
            
            # Section titles (all caps or specific keywords)
            elif line.isupper() or any(keyword in line for keyword in ['APPROVED', 'REJECTED', 'NOTICE', 'AGENDA', 'BUDGET']):
                story.append(Paragraph(f"<b>{line}</b>", section_style))
            
            # Numbered or bulleted lists
            elif re.match(r'^\d+\.', line) or line.startswith('-') or line.startswith('•'):
                val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
                story.append(Paragraph(val, normal_style))
            
            # Regular paragraphs
            else:
                val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
                story.append(Paragraph(val, normal_style))
    
    # Build PDF
    print(f"Building PDF: {output_file}...")
    pdf_doc.build(story)
    print(f"✓ PDF created successfully: {output_file}")

# Generate PDFs
print("="*60)
print("CONVERTING TEXT FILES TO PDF")
print("="*60)
print()

create_pdf_from_text('agm_minutes_raw.txt', 'AGM_Minutes.pdf', 'AGM Minutes Documents')
print()

create_pdf_from_text('society_notices_raw.txt', 'Society_Notices.pdf', 'Housing Society Notices')
print()

create_pdf_from_text('society_circulars_raw.txt', 'Society_Circulars.pdf', 'Housing Society Circulars')
print()

print("="*60)
print("ALL PDF CONVERSIONS COMPLETE!")
print("="*60)
print("\nPDF files created:")
print("1. AGM_Minutes.pdf")
print("2. Society_Notices.pdf")
print("3. Society_Circulars.pdf")
