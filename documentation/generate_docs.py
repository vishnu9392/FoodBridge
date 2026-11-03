#!/usr/bin/env python3
"""
FoodBridge Complete Project Documentation Generator
Generates:
1. FoodBridge_Complete_Project_Report.docx
2. FoodBridge_Complete_Project_Report.pdf
3. FoodBridge_Public_Project_Report.pdf
4. FoodBridge_Quick_Reference.pdf
"""

import os
import sys
from datetime import datetime

# Import python-docx
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# Import ReportLab
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

DOC_DIR = r"c:\Users\vishn\OneDrive\Desktop\projects\projects\FoodBridge\documentation"
os.makedirs(DOC_DIR, exist_ok=True)

print(f"Documentation output directory: {DOC_DIR}")
