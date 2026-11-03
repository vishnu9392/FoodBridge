"""
DOCX Generator for FoodBridge Complete Project Report
Generates FoodBridge_Complete_Project_Report.docx using python-docx.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from content_data import get_report_content

DOC_DIR = r"c:\Users\vishn\OneDrive\Desktop\projects\projects\FoodBridge\documentation"

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding in twentieths of a point (dxa)."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)

def add_code_block(doc, text):
    """Adds a shaded monospace code / diagram box."""
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.2)
    p.paragraph_format.right_indent = Inches(0.2)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(8)
    
    # Table as code container for clean background
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "F5F5F7")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    cp = cell.paragraphs[0]
    cp.paragraph_format.space_before = Pt(0)
    cp.paragraph_format.space_after = Pt(0)
    cp.paragraph_format.line_spacing = 1.05
    run = cp.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(30, 30, 35)

def build_docx(is_public=False):
    data = get_report_content(is_public=is_public)
    meta = data["metadata"]
    
    filename = "FoodBridge_Complete_Project_Report.docx"
    filepath = os.path.join(DOC_DIR, filename)
    
    doc = docx.Document()
    
    # Page Setup: A4, 1-inch margins
    for section in doc.sections:
        section.page_width = Inches(8.27)  # A4 width
        section.page_height = Inches(11.69) # A4 height
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("FoodBridge — Smart Food Waste Reduction Platform")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(140, 140, 140)
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Department of Computer Science & Engineering • Academic Project Report • 2025–2026")
        frun.font.name = "Arial"
        frun.font.size = Pt(8)
        frun.font.color.rgb = RGBColor(140, 140, 140)

    # Base Styles
    styles = doc.styles
    normal_style = styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(40, 40, 40)
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(6)

    # ================= COVER PAGE =================
    cover_p = doc.add_paragraph()
    cover_p.paragraph_format.space_before = Pt(40)
    cover_p.paragraph_format.space_after = Pt(12)
    cover_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    tag_run = cover_p.add_run("ACADEMIC CAPSTONE PROJECT REPORT • 2025–2026\n")
    tag_run.font.name = "Arial"
    tag_run.font.size = Pt(10)
    tag_run.font.bold = True
    tag_run.font.color.rgb = RGBColor(255, 140, 66) # Brand Orange
    
    title_run = cover_p.add_run("FOODBRIDGE\n")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(28)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(26, 26, 29) # Charcoal
    
    sub_run = cover_p.add_run(
        "Smart Food Waste Reduction and Surplus Redistribution Platform\n"
        "with Algorithmic Expiry Intelligence and Real-Time Pickup Logistics\n"
    )
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(13)
    sub_run.font.color.rgb = RGBColor(90, 90, 95)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(40)
    
    # Author & Institution Box
    info_table = doc.add_table(rows=5, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_data = [
        ("Candidate Name / Author:", f"{meta['author']} ({meta['author_email']})"),
        ("Degree & Department:", "Bachelor of Technology in Computer Science & Engineering"),
        ("Source Code Repository:", f"{meta['github_repo']}"),
        ("Deployed Cloud Backend:", f"{meta['live_backend']}"),
        ("Database Cluster:", f"{meta['live_database']}")
    ]
    for i, (k, v) in enumerate(table_data):
        row = info_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.5)
        c1.width = Inches(3.7)
        set_cell_background(c0, "FAFAFA")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, top=80, bottom=80, left=100, right=100)
        set_cell_margins(c1, top=80, bottom=80, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = RGBColor(60, 60, 65)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(30, 30, 35)

    doc.add_page_break()

    # ================= TABLE OF CONTENTS =================
    toc_heading = doc.add_paragraph()
    tr = toc_heading.add_run("TABLE OF CONTENTS")
    tr.font.name = "Arial"
    tr.font.size = Pt(18)
    tr.font.bold = True
    tr.font.color.rgb = RGBColor(26, 26, 29)
    toc_heading.paragraph_format.space_after = Pt(14)
    
    for ch in data["chapters"]:
        toc_p = doc.add_paragraph()
        toc_p.paragraph_format.line_spacing = 1.15
        toc_p.paragraph_format.space_after = Pt(3)
        ch_run = toc_p.add_run(f"Chapter {ch['number']}: {ch['title']}")
        ch_run.font.bold = True
        ch_run.font.size = Pt(10)
        ch_run.font.color.rgb = RGBColor(50, 50, 55)
        
        for sec in ch.get("sections", []):
            sp = doc.add_paragraph()
            sp.paragraph_format.left_indent = Inches(0.3)
            sp.paragraph_format.line_spacing = 1.1
            sp.paragraph_format.space_after = Pt(2)
            s_run = sp.add_run(sec["heading"])
            s_run.font.size = Pt(9)
            s_run.font.color.rgb = RGBColor(90, 90, 95)
            
    doc.add_page_break()

    # ================= CHAPTERS CONTENT =================
    for ch in data["chapters"]:
        ch_p = doc.add_paragraph()
        ch_p.paragraph_format.space_before = Pt(16)
        ch_p.paragraph_format.space_after = Pt(8)
        ch_run = ch_p.add_run(f"Chapter {ch['number']}: {ch['title']}")
        ch_run.font.name = "Arial"
        ch_run.font.size = Pt(16)
        ch_run.font.bold = True
        ch_run.font.color.rgb = RGBColor(255, 140, 66) # Orange Heading
        
        for sec in ch.get("sections", []):
            sec_p = doc.add_paragraph()
            sec_p.paragraph_format.space_before = Pt(12)
            sec_p.paragraph_format.space_after = Pt(4)
            sec_run = sec_p.add_run(sec["heading"])
            sec_run.font.name = "Arial"
            sec_run.font.size = Pt(12)
            sec_run.font.bold = True
            sec_run.font.color.rgb = RGBColor(26, 26, 29)
            
            if "text" in sec and sec["text"]:
                paragraphs = sec["text"].split("\n\n")
                for text_para in paragraphs:
                    tp = doc.add_paragraph(text_para.strip())
                    tp.paragraph_format.line_spacing = 1.2
                    tp.paragraph_format.space_after = Pt(6)
                    
            if "diagram" in sec and sec["diagram"]:
                add_code_block(doc, sec["diagram"])
                
            if "table" in sec and sec["table"]:
                t_info = sec["table"]
                headers = t_info["headers"]
                rows = t_info["rows"]
                
                table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                
                # Header row
                hdr_row = table.rows[0]
                for c_idx, h_text in enumerate(headers):
                    cell = hdr_row.cells[c_idx]
                    set_cell_background(cell, "FF8C42") # Orange Header
                    set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                    hp = cell.paragraphs[0]
                    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    hrun = hp.add_run(h_text)
                    hrun.font.name = "Arial"
                    hrun.font.bold = True
                    hrun.font.size = Pt(9)
                    hrun.font.color.rgb = RGBColor(255, 255, 255)
                    
                # Data rows
                for r_idx, r_data in enumerate(rows):
                    row = table.rows[r_idx + 1]
                    bg = "FFFFFF" if r_idx % 2 == 0 else "F9F9FA"
                    for c_idx, val in enumerate(r_data):
                        cell = row.cells[c_idx]
                        set_cell_background(cell, bg)
                        set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
                        p = cell.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                        run = p.add_run(str(val))
                        run.font.name = "Arial"
                        run.font.size = Pt(8.5)
                        run.font.color.rgb = RGBColor(40, 40, 45)
                        
                doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.save(filepath)
    print(f"Successfully generated DOCX: {filepath}")
    return filepath

if __name__ == "__main__":
    build_docx(is_public=False)
