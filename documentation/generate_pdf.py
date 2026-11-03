"""
PDF Generator for FoodBridge Technical Project Reports
Generates:
1. FoodBridge_Complete_Project_Report.pdf
2. FoodBridge_Public_Project_Report.pdf
3. FoodBridge_Quick_Reference.pdf
Using ReportLab with custom NumberedCanvas, professional styling, and robust cell wrapping.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Preformatted
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

from content_data import get_report_content

DOC_DIR = r"c:\Users\vishn\OneDrive\Desktop\projects\projects\FoodBridge\documentation"

# Color Palette
COLOR_PRIMARY_CHARCOAL = colors.HexColor("#1A1A1D")
COLOR_ACCENT_ORANGE = colors.HexColor("#FF8C42")
COLOR_TEXT_MAIN = colors.HexColor("#222224")
COLOR_TEXT_MUTED = colors.HexColor("#66666E")
COLOR_BG_CODE = colors.HexColor("#F4F4F6")
COLOR_BG_ALT_ROW = colors.HexColor("#F9F9FB")
COLOR_BORDER = colors.HexColor("#DDDDDF")

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute total page count and draw running header/footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return
            
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_TEXT_MUTED)
        
        # Running Header
        self.drawString(54, 842 - 36, "FoodBridge — Smart Food Waste Reduction Platform")
        self.drawRightString(595 - 54, 842 - 36, "Academic Technical Report")
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(54, 842 - 42, 595 - 54, 842 - 42)
        
        # Running Footer
        self.line(54, 48, 595 - 54, 48)
        self.drawString(54, 34, "Department of Computer Science & Engineering • 2025–2026")
        self.drawRightString(595 - 54, 34, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def get_styles():
    """Builds a cohesive paragraph style sheet."""
    base = getSampleStyleSheet()
    
    styles = {
        "CoverTag": ParagraphStyle(
            "CoverTag",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=COLOR_ACCENT_ORANGE,
            alignment=TA_CENTER,
            spaceAfter=12
        ),
        "CoverTitle": ParagraphStyle(
            "CoverTitle",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=COLOR_PRIMARY_CHARCOAL,
            alignment=TA_CENTER,
            spaceAfter=10
        ),
        "CoverSubtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            textColor=COLOR_TEXT_MUTED,
            alignment=TA_CENTER,
            spaceAfter=25
        ),
        "MetaLabel": ParagraphStyle(
            "MetaLabel",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=12,
            textColor=COLOR_PRIMARY_CHARCOAL
        ),
        "MetaValue": ParagraphStyle(
            "MetaValue",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=COLOR_TEXT_MAIN
        ),
        "TOCHeading": ParagraphStyle(
            "TOCHeading",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=COLOR_PRIMARY_CHARCOAL,
            spaceAfter=14
        ),
        "TOCItem": ParagraphStyle(
            "TOCItem",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.5,
            leading=13,
            textColor=COLOR_PRIMARY_CHARCOAL,
            spaceAfter=3
        ),
        "TOCSubItem": ParagraphStyle(
            "TOCSubItem",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11,
            textColor=COLOR_TEXT_MUTED,
            leftIndent=15,
            spaceAfter=2
        ),
        "ChapterHeading": ParagraphStyle(
            "ChapterHeading",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=COLOR_ACCENT_ORANGE,
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True
        ),
        "SectionHeading": ParagraphStyle(
            "SectionHeading",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=15,
            textColor=COLOR_PRIMARY_CHARCOAL,
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True
        ),
        "Body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=COLOR_TEXT_MAIN,
            alignment=TA_JUSTIFY,
            spaceAfter=6
        ),
        "CodeText": ParagraphStyle(
            "CodeText",
            parent=base["Normal"],
            fontName="Courier",
            fontSize=7.2,
            leading=9.5,
            textColor=colors.HexColor("#202025")
        ),
        "TableHeader": ParagraphStyle(
            "TableHeader",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10.5,
            textColor=colors.white,
            alignment=TA_LEFT
        ),
        "TableCell": ParagraphStyle(
            "TableCell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.8,
            leading=10,
            textColor=COLOR_TEXT_MAIN,
            alignment=TA_LEFT
        )
    }
    return styles


def generate_main_pdf(is_public=False):
    data = get_report_content(is_public=is_public)
    meta = data["metadata"]
    styles = get_styles()
    
    filename = "FoodBridge_Public_Project_Report.pdf" if is_public else "FoodBridge_Complete_Project_Report.pdf"
    filepath = os.path.join(DOC_DIR, filename)
    
    # 54pt (0.75 in) margins on A4 (595.27 x 841.89 pt) -> Printable width = 487 pt
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    story = []
    
    # ================= COVER PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("ACADEMIC CAPSTONE ENGINEERING REPORT • 2025–2026", styles["CoverTag"]))
    story.append(Paragraph("FOODBRIDGE", styles["CoverTitle"]))
    story.append(Paragraph(
        "Smart Food Waste Reduction and Surplus Redistribution Platform<br/>"
        "with Algorithmic Expiry Intelligence and Real-Time Pickup Logistics",
        styles["CoverSubtitle"]
    ))
    story.append(HRFlowable(width="60%", thickness=2, color=COLOR_ACCENT_ORANGE, spaceBefore=5, spaceAfter=30))
    
    # Meta Box Table
    meta_data = [
        [Paragraph("Candidate Name / Author:", styles["MetaLabel"]), Paragraph(f"{meta['author']} ({meta['author_email']})", styles["MetaValue"])],
        [Paragraph("Academic Degree:", styles["MetaLabel"]), Paragraph("Bachelor of Technology in Computer Science & Engineering", styles["MetaValue"])],
        [Paragraph("Source Code Repository:", styles["MetaLabel"]), Paragraph(f"<font color='#0066cc'><u>{meta['github_repo']}</u></font>", styles["MetaValue"])],
        [Paragraph("Production Cloud API:", styles["MetaLabel"]), Paragraph(f"<font color='#0066cc'><u>{meta['live_backend']}</u></font>", styles["MetaValue"])],
        [Paragraph("Database Infrastructure:", styles["MetaLabel"]), Paragraph(meta['live_database'], styles["MetaValue"])],
        [Paragraph("Security Classification:", styles["MetaLabel"]), Paragraph("Public Redacted Version" if is_public else "Official Academic Complete Version (Includes Evaluation Credentials)", styles["MetaValue"])]
    ]
    meta_table = Table(meta_data, colWidths=[160, 320])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#F5F5F7")),
        ('BACKGROUND', (1,0), (1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, COLOR_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(PageBreak())
    
    # ================= TABLE OF CONTENTS =================
    story.append(Paragraph("TABLE OF CONTENTS", styles["TOCHeading"]))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_PRIMARY_CHARCOAL, spaceBefore=2, spaceAfter=14))
    
    for ch in data["chapters"]:
        story.append(Paragraph(f"Chapter {ch['number']}: {ch['title']}", styles["TOCItem"]))
        for sec in ch.get("sections", []):
            story.append(Paragraph(sec["heading"], styles["TOCSubItem"]))
            
    story.append(PageBreak())
    
    # ================= CHAPTERS =================
    printable_width = 487  # 595 - 108
    
    for ch in data["chapters"]:
        story.append(Paragraph(f"Chapter {ch['number']}: {ch['title']}", styles["ChapterHeading"]))
        story.append(HRFlowable(width="100%", thickness=0.75, color=COLOR_ACCENT_ORANGE, spaceBefore=2, spaceAfter=8))
        
        for sec in ch.get("sections", []):
            story.append(Paragraph(sec["heading"], styles["SectionHeading"]))
            
            if "text" in sec and sec["text"]:
                paras = sec["text"].split("\n\n")
                for p_text in paras:
                    story.append(Paragraph(p_text.strip().replace("\n", "<br/>"), styles["Body"]))
                    
            if "diagram" in sec and sec["diagram"]:
                diag_text = sec["diagram"].strip()
                diag_flow = Preformatted(diag_text, styles["CodeText"])
                t_diag = Table([[diag_flow]], colWidths=[printable_width])
                t_diag.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), COLOR_BG_CODE),
                    ('BOX', (0,0), (-1,-1), 1, COLOR_BORDER),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ]))
                story.append(Spacer(1, 4))
                story.append(t_diag)
                story.append(Spacer(1, 6))
                
            if "table" in sec and sec["table"]:
                t_info = sec["table"]
                headers = t_info["headers"]
                rows = t_info["rows"]
                num_cols = len(headers)
                
                # Dynamic column width calculation
                if num_cols == 2:
                    col_widths = [150, 337]
                elif num_cols == 3:
                    col_widths = [120, 180, 187]
                elif num_cols == 5:
                    col_widths = [75, 110, 120, 125, 57]
                elif num_cols == 6:
                    col_widths = [65, 85, 95, 75, 105, 62]
                else:
                    col_widths = [printable_width / num_cols] * num_cols
                    
                table_cells = []
                hdr_row = [Paragraph(f"<b>{h}</b>", styles["TableHeader"]) for h in headers]
                table_cells.append(hdr_row)
                
                for r_idx, row in enumerate(rows):
                    data_row = [Paragraph(str(val), styles["TableCell"]) for val in row]
                    table_cells.append(data_row)
                    
                rl_table = Table(table_cells, colWidths=col_widths, repeatRows=1)
                t_style = [
                    ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT_ORANGE),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOX', (0,0), (-1,-1), 0.75, COLOR_BORDER),
                    ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('LEFTPADDING', (0,0), (-1,-1), 5),
                    ('RIGHTPADDING', (0,0), (-1,-1), 5),
                ]
                for r_idx in range(1, len(table_cells)):
                    if r_idx % 2 == 0:
                        t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), COLOR_BG_ALT_ROW))
                        
                rl_table.setStyle(TableStyle(t_style))
                story.append(Spacer(1, 4))
                story.append(rl_table)
                story.append(Spacer(1, 6))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filepath}")
    return filepath


def generate_quick_reference_pdf():
    """Generates the concise, high-density FoodBridge Quick Reference PDF."""
    filepath = os.path.join(DOC_DIR, "FoodBridge_Quick_Reference.pdf")
    styles = get_styles()
    
    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    width = 523 # 595 - 72
    
    # Title Banner
    story.append(Paragraph("<b>FOODBRIDGE — TECHNICAL ARCHITECTURE QUICK REFERENCE</b>", ParagraphStyle(
        "QRTitle", parent=styles["Body"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=COLOR_PRIMARY_CHARCOAL, alignment=TA_CENTER
    )))
    story.append(Paragraph("Full-Stack Community Surplus Food Rescue & Algorithmic Expiry Platform • Release 1.0.0", ParagraphStyle(
        "QRSub", parent=styles["Body"], fontName="Helvetica", fontSize=9, leading=12, textColor=COLOR_ACCENT_ORANGE, alignment=TA_CENTER, spaceAfter=8
    )))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_ACCENT_ORANGE, spaceBefore=2, spaceAfter=10))
    
    # 1. System Topology Table
    story.append(Paragraph("<b>1. PRODUCTION ARCHITECTURE TOPOLOGY</b>", styles["SectionHeading"]))
    arch_data = [
        [Paragraph("<b>Tier</b>", styles["TableHeader"]), Paragraph("<b>Host / Service</b>", styles["TableHeader"]), Paragraph("<b>Runtime & Stack</b>", styles["TableHeader"]), Paragraph("<b>Live URL / Coordinates</b>", styles["TableHeader"])],
        [Paragraph("Frontend SPA", styles["TableCell"]), Paragraph("Vercel Global Edge", styles["TableCell"]), Paragraph("React 18.3, TypeScript 5.7, Vite 6.4", styles["TableCell"]), Paragraph("Deploying to Vercel (dist)", styles["TableCell"])],
        [Paragraph("Backend REST API", styles["TableCell"]), Paragraph("Render Cloud Container", styles["TableCell"]), Paragraph("Node.js 24.22 LTS, Express 4.21, Mongoose 8.9", styles["TableCell"]), Paragraph("https://foodbridge-xnpd.onrender.com", styles["TableCell"])],
        [Paragraph("Database Tier", styles["TableCell"]), Paragraph("MongoDB Atlas (AWS)", styles["TableCell"]), Paragraph("Replica Set M0 (Cluster0 / foodbridge)", styles["TableCell"]), Paragraph("Encrypted SRV (TLS Port 27017)", styles["TableCell"])],
        [Paragraph("Source Repository", styles["TableCell"]), Paragraph("GitHub Cloud", styles["TableCell"]), Paragraph("Branch 'main', Git 2.45+", styles["TableCell"]), Paragraph("https://github.com/vishnu9392/FoodBridge", styles["TableCell"])]
    ]
    t_arch = Table(arch_data, colWidths=[90, 110, 155, 168])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT_ORANGE),
        ('BOX', (0,0), (-1,-1), 0.75, COLOR_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))
    
    # 2. Database Schema Summary
    story.append(Paragraph("<b>2. MONGOOSE DATABASE SCHEMA REFERENCE</b>", styles["SectionHeading"]))
    schema_data = [
        [Paragraph("<b>Model</b>", styles["TableHeader"]), Paragraph("<b>Key Attributes & BSON Types</b>", styles["TableHeader"]), Paragraph("<b>Validation & Referential Integrity</b>", styles["TableHeader"])],
        [Paragraph("<b>User</b><br/>(users)", styles["TableCell"]), Paragraph("email (Str), passwordHash (Str), role (Enum: donor/recipient/admin), name (Str), organization (Str), phone (Str), address (Str), bio (Str)", styles["TableCell"]), Paragraph("Unique email index, bcrypt 10 salt rounds, role-based guard compatibility", styles["TableCell"])],
        [Paragraph("<b>Donation</b><br/>(donations)", styles["TableCell"]), Paragraph("donor (Ref User), foodName (Str), category (Enum 7), quantity (Num), availableQuantity (Num), reservedQuantity (Num), unit (Enum 5), prepDate (Date), expiryDate (Date), location (Subdoc: lat/lng/address), status (Enum 5)", styles["TableCell"]), Paragraph("Invariant: available + reserved <= total. expiryDate must be > prepDate. Filtered by active unexpired.", styles["TableCell"])],
        [Paragraph("<b>Pickup</b><br/>(pickups)", styles["TableCell"]), Paragraph("donation (Ref Donation), recipient (Ref User), donor (Ref User), requestedQuantity (Num), status (Enum 5), preferredDate/Time (Str), notes (Str)", styles["TableCell"]), Paragraph("State Machine: pending -> approved/rejected -> completed/cancelled. Deducts on approve, restores on cancel.", styles["TableCell"])]
    ]
    t_sch = Table(schema_data, colWidths=[75, 275, 173])
    t_sch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY_CHARCOAL),
        ('BOX', (0,0), (-1,-1), 0.75, COLOR_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_sch)
    story.append(Spacer(1, 10))
    
    # 3. Complete REST API Matrix
    story.append(Paragraph("<b>3. REST API ENDPOINT SPECIFICATION MATRIX (18 Endpoints)</b>", styles["SectionHeading"]))
    api_data = [
        [Paragraph("<b>Method & URL</b>", styles["TableHeader"]), Paragraph("<b>Auth Guard</b>", styles["TableHeader"]), Paragraph("<b>Role</b>", styles["TableHeader"]), Paragraph("<b>Operation & Controller Logic</b>", styles["TableHeader"])],
        [Paragraph("POST /api/auth/register", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Hashes password with bcrypt, generates JWT session token (201 Created)", styles["TableCell"])],
        [Paragraph("POST /api/auth/login", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Verifies credentials, signs 7-day HMAC-SHA256 JWT token (200 OK)", styles["TableCell"])],
        [Paragraph("GET /api/auth/me", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Returns authenticated user profile from req.user decoded claims", styles["TableCell"])],
        [Paragraph("PUT /api/auth/profile", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Updates telephone, organization name, address, and mission bio", styles["TableCell"])],
        [Paragraph("PUT /api/auth/password", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Validates old password before hashing new credentials", styles["TableCell"])],
        [Paragraph("GET /api/donations", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Queries available, unexpired surplus items with category/search filters", styles["TableCell"])],
        [Paragraph("GET /api/donations/:id", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Returns comprehensive single donation details with coordinates and donor profile", styles["TableCell"])],
        [Paragraph("GET /api/donations/user/my", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Donor", styles["TableCell"]), Paragraph("Queries all surplus listings published by logged-in donor", styles["TableCell"])],
        [Paragraph("POST /api/donations", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Donor", styles["TableCell"]), Paragraph("Publishes surplus batch, validates timestamps and GPS location (201)", styles["TableCell"])],
        [Paragraph("PUT /api/donations/:id", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Owner", styles["TableCell"]), Paragraph("Updates active donation record (guarded by donor ownership check)", styles["TableCell"])],
        [Paragraph("DELETE /api/donations/:id", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Owner", styles["TableCell"]), Paragraph("Soft-cancels and removes active listing from marketplace", styles["TableCell"])],
        [Paragraph("GET /api/pickups", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Lists all pickup requests involving user as donor or recipient", styles["TableCell"])],
        [Paragraph("POST /api/pickups", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Submits pickup request, verifies requestedQuantity <= availableQuantity", styles["TableCell"])],
        [Paragraph("PATCH /api/pickups/:id/status", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Involved", styles["TableCell"]), Paragraph("Drives state machine (approved, rejected, completed, cancelled)", styles["TableCell"])],
        [Paragraph("GET /api/dashboard/stats", styles["TableCell"]), Paragraph("Bearer", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Aggregates rescue metrics (kg rescued, meals served, pending requests)", styles["TableCell"])],
        [Paragraph("POST /api/expiry/calculate", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Calculates delta milliseconds, status (fresh/expiring_soon/expired)", styles["TableCell"])],
        [Paragraph("POST /api/expiry/estimate", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Calculates shelf-life projection using temperature storage multipliers", styles["TableCell"])],
        [Paragraph("GET /api/health", styles["TableCell"]), Paragraph("Public", styles["TableCell"]), Paragraph("Any", styles["TableCell"]), Paragraph("Diagnostics reporting uptime, Node version, and MongoDB connection state", styles["TableCell"])]
    ]
    t_api = Table(api_data, colWidths=[125, 55, 45, 298])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT_ORANGE),
        ('BOX', (0,0), (-1,-1), 0.75, COLOR_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, COLOR_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 10))
    
    # 4. State Machine & Quality Summary
    story.append(Paragraph("<b>4. STATE MACHINE INVARIANTS & VERIFICATION SUMMARY</b>", styles["SectionHeading"]))
    summary_text = (
        "<b>State Machine Lifecycle:</b> [pending] ➔ (Donor Approves) ➔ [approved] ➔ (Handover Verified) ➔ [completed].<br/>"
        "<b>Alternative Paths:</b> [pending] ➔ (Donor Rejects) ➔ [rejected] | [pending/approved] ➔ (Party Cancels) ➔ [cancelled].<br/>"
        "<b>Inventory Guard:</b> Approving a request atomically deducts requested portions from availableQuantity and adds them to reservedQuantity. "
        "Rejecting or cancelling restores portions back to availableQuantity.<br/>"
        "<b>Automated Test Suite:</b> 20/20 unit tests passed (0 failures, 477 ms). Verified: past date expiry, 24h urgency threshold, "
        "unparseable dates, storage multipliers, donor approval permissions, terminal state immutability, email RFC regex, and positive quantity rules."
    )
    story.append(Paragraph(summary_text, styles["Body"]))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Quick Reference PDF: {filepath}")
    return filepath

if __name__ == "__main__":
    generate_main_pdf(is_public=False)
    generate_main_pdf(is_public=True)
    generate_quick_reference_pdf()
