import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

def create_pelunasan_invoice():
    pdf_path = "Administration/Invoice_Pelunasan50_Jasa_Web_NSG.pdf"
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    
    # Palette
    c_primary = colors.HexColor("#0f766e")    # Teal 700
    c_dark = colors.HexColor("#0f172a")       # Slate 900
    c_slate = colors.HexColor("#334155")      # Slate 700
    c_light_bg = colors.HexColor("#f8fafc")   # Slate 50
    c_border = colors.HexColor("#cbd5e1")     # Slate 300
    c_unpaid_bg = colors.HexColor("#fef2f2")  # Red 50
    c_unpaid_text = colors.HexColor("#b91c1c")# Red 700
    c_success_text = colors.HexColor("#15803d") # Green 700
    
    # Styles
    styles = getSampleStyleSheet()
    
    header_left_title = ParagraphStyle(
        'HeaderLeftTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_primary
    )
    
    header_left_sub = ParagraphStyle(
        'HeaderLeftSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_slate
    )
    
    header_right_title = ParagraphStyle(
        'HeaderRightTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=2, # Right
        textColor=c_dark
    )
    
    header_right_meta = ParagraphStyle(
        'HeaderRightMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        alignment=2, # Right
        textColor=c_slate
    )
    
    # 1. Header Section
    header_data = [
        [
            Paragraph("<b>WEB & IT DEVELOPMENT PARTNER</b>", header_left_title),
            Paragraph("<b>INVOICE</b>", header_right_title)
        ],
        [
            Paragraph("Professional Web Design, Domain & Cloud Infrastructure Services<br/>Jakarta, Indonesia | Contact: Dendy Perdana Kun Aditya", header_left_sub),
            Paragraph("<b>No. Invoice:</b> INV-NSG/2026/08/003-SRV<br/><b>Tanggal:</b> 27 Agustus 2026<br/><b>Jatuh Tempo:</b> 03 September 2026<br/><b>Status:</b> <font color='#b91c1c'><b>UNPAID</b></font>", header_right_meta)
        ]
    ]
    
    header_table = Table(header_data, colWidths=[310, 212])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))
    
    # Top Divider Line
    story.append(HRFlowable(width="100%", thickness=2, color=c_primary, spaceBefore=0, spaceAfter=14))
    
    # 2. Billed To & Payment Method Boxes
    box_title_style = ParagraphStyle('BoxTitle', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=c_dark)
    box_content_style = ParagraphStyle('BoxContent', fontName='Helvetica', fontSize=8.5, leading=12, textColor=c_slate)
    
    billed_to_content = Paragraph(
        "<b>PT NATTU GLOBAL SYNERGY</b><br/>"
        "Jl. Serdang Raya No. 12, Kel. Sumur Batu, Kec. Kemayoran<br/>"
        "Kota Adm. Jakarta Pusat, DKI Jakarta 10650<br/>"
        "<b>UP / Attn:</b> Bpk. Owner / Direksi PT Nattu Global Synergy<br/>"
        "<b>Email:</b> info@nattuglobalsynergy.co.id",
        box_content_style
    )
    
    payment_content = Paragraph(
        "<b>Bank Transfer (BSI Syariah):</b><br/>"
        "<b>Nama Bank:</b> Bank BSI (Bank Syariah Indonesia)<br/>"
        "<b>No. Rekening:</b> 7358484535<br/>"
        "<b>Atas Nama:</b> Dendy Perdana Kun Aditya<br/>"
        "<i>*Mohon lampirkan bukti transfer setelah pembayaran.</i>",
        box_content_style
    )
    
    boxes_data = [
        [
            Paragraph("<b>DITUJUKAN KEPADA (BILLED TO):</b>", box_title_style),
            Paragraph("<b>METODE PEMBAYARAN & REKENING:</b>", box_title_style)
        ],
        [
            billed_to_content,
            payment_content
        ]
    ]
    
    boxes_table = Table(boxes_data, colWidths=[256, 256])
    boxes_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (0,1), 0.5, c_border),
        ('BOX', (1,0), (1,1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(boxes_table)
    story.append(Spacer(1, 14))
    
    # 3. Items Table
    th_style = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white)
    td_num_style = ParagraphStyle('TDNum', fontName='Helvetica', fontSize=8.5, leading=11, alignment=1, textColor=c_slate)
    td_desc_style = ParagraphStyle('TDDesc', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=c_slate)
    td_schema_style = ParagraphStyle('TDSchema', fontName='Helvetica', fontSize=8.5, leading=11, alignment=1, textColor=c_slate)
    td_price_style = ParagraphStyle('TDPrice', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=c_slate)
    
    item1_desc = Paragraph(
        "<b>Jasa Pembuatan Website Company Profile & Integrasi Email</b><br/>"
        "<font color='#64748b'>Desain Tampilan Modern Compro, 3 Lini Bisnis, Integrasi Email Gmail & DNS, SSL, Responsive Mobile & Tablet, Optimasi SEO Dasar.</font>",
        td_desc_style
    )
    
    item2_desc = Paragraph(
        "<b>Jasa Maintenance & Technical Support (1 Tahun)</b><br/>"
        "<font color='#64748b'>Monitoring Server, Backup Data Rutin, Keamanan Malware, Pengelolaan & Tambah Email Staf, Update Konten Minor Tanpa Batas Frekuensi.</font>",
        td_desc_style
    )
    
    items_data = [
        [
            Paragraph("<b>No</b>", th_style),
            Paragraph("<b>Deskripsi Item & Spesifikasi</b>", th_style),
            Paragraph("<b>Tipe Skema</b>", th_style),
            Paragraph("<b>Nominal (IDR)</b>", ParagraphStyle('THR', parent=th_style, alignment=2))
        ],
        [
            Paragraph("1", td_num_style),
            item1_desc,
            Paragraph("Sekali Bayar", td_schema_style),
            Paragraph("Rp 2.800.000", td_price_style)
        ],
        [
            Paragraph("2", td_num_style),
            item2_desc,
            Paragraph("1 Tahun", td_schema_style),
            Paragraph("Rp 1.500.000", td_price_style)
        ],
        # Summary Rows
        [
            "",
            Paragraph("<b>TOTAL BIAYA JASA FULL (100%):</b>", ParagraphStyle('TotL', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=c_dark)),
            "",
            Paragraph("Rp 4.300.000", ParagraphStyle('TotR', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=2, textColor=c_dark))
        ],
        [
            "",
            Paragraph("<b>UANG MUKA / DP 50% (TELAH DIBAYAR - INV-002):</b>", ParagraphStyle('DpL', fontName='Helvetica', fontSize=8.5, leading=11, alignment=2, textColor=c_success_text)),
            "",
            Paragraph("(Rp 2.150.000)", ParagraphStyle('DpR', fontName='Helvetica', fontSize=8.5, leading=11, alignment=2, textColor=c_success_text))
        ],
        [
            "",
            Paragraph("<b>SISA PELUNASAN 50% (TAGIHAN INI):</b>", ParagraphStyle('PelL', fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=2, textColor=c_primary)),
            "",
            Paragraph("<b>Rp 2.150.000</b>", ParagraphStyle('PelR', fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=2, textColor=c_primary))
        ]
    ]
    
    items_table = Table(items_data, colWidths=[26, 276, 95, 115])
    items_table.setStyle(TableStyle([
        # Header Row
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,2), 'CENTER'),
        ('ALIGN', (3,0), (3,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        
        # Data Rows
        ('GRID', (0,0), (-1,2), 0.5, c_border),
        ('TOPPADDING', (0,1), (-1,2), 6),
        ('BOTTOMPADDING', (0,1), (-1,2), 6),
        
        # Summary Rows formatting
        ('SPAN', (1,3), (2,3)),
        ('SPAN', (1,4), (2,4)),
        ('SPAN', (1,5), (2,5)),
        ('LINEABOVE', (1,3), (3,3), 1, c_dark),
        ('BACKGROUND', (1,5), (3,5), colors.HexColor("#f0fdfa")), # Teal 50 highlight
        ('BOX', (1,5), (3,5), 1, c_primary),
        ('TOPPADDING', (0,3), (-1,-1), 4),
        ('BOTTOMPADDING', (0,3), (-1,-1), 4),
        ('RIGHTPADDING', (3,0), (3,-1), 6),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 10))
    
    # 4. Terbilang Box
    terbilang_data = [[
        Paragraph("<b>TERBILANG:</b> <i>\"Dua Juta Seratus Lima Puluh Ribu Rupiah\"</i>", ParagraphStyle('Terbilang', fontName='Helvetica', fontSize=8.5, leading=11, textColor=c_dark))
    ]]
    terbilang_table = Table(terbilang_data, colWidths=[512])
    terbilang_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(terbilang_table)
    story.append(Spacer(1, 14))
    
    # 5. Terms and Signatures
    terms_title = ParagraphStyle('TermsTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=c_dark)
    terms_text = ParagraphStyle('TermsText', fontName='Helvetica', fontSize=7.8, leading=11, textColor=c_slate)
    
    terms_content = Paragraph(
        "<b>CATATAN & KETENTUAN PEMBAYARAN:</b><br/>"
        "1. Tagihan ini adalah <b>Pelunasan 50% (Final Settlement)</b> Biaya Jasa Pembuatan Website & Maintenance "
        "sesuai penawaran <b>QUO-NSG-2026/07/001</b>.<br/>"
        "2. Pengerjaan website, setup cPanel hosting Biznet Gio, SSL, responsive layout, dan integrasi email "
        "telah selesai teruji dan aktif (Live Production).<br/>"
        "3. Tagihan ini diterbitkan secara sah dan berfungsi sebagai bukti penagihan resmi pelunasan.<br/>"
        "4. Pembayaran dikirimkan ke rekening BSI: <b>7358484535</b> a.n <b>Dendy Perdana Kun Aditya</b>.",
        terms_text
    )
    
    sig_content = Paragraph(
        "Hormat Kami,<br/>"
        "<b>Developer & IT Partner</b><br/><br/><br/><br/>"
        "<u><b>Dendy Perdana Kun Aditya</b></u><br/>"
        "Web & System Developer",
        ParagraphStyle('Sig', fontName='Helvetica', fontSize=8.5, leading=12, alignment=1, textColor=c_dark)
    )
    
    bottom_data = [[terms_content, sig_content]]
    bottom_table = Table(bottom_data, colWidths=[332, 180])
    bottom_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(bottom_table)
    
    doc.build(story)
    print("Generated successfully:", pdf_path)

if __name__ == "__main__":
    create_pelunasan_invoice()
