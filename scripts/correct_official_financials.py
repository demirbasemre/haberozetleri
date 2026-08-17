#!/usr/bin/env python3
"""
scripts/correct_official_financials.py
Corrects erroneous financial metrics across all airlines based on official audited financial statements (IFRS, KAP, SEC 10-K, Annual Reports).
"""

import json

def load_data():
    with open('data/financials.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open('data/financials.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def recalculate_margins_and_growth(airline):
    fin = airline.get('financial', {})
    rev_dict = fin.get('total_revenue_musd', {})
    op_dict = fin.get('operating_profit_musd', {})
    net_dict = fin.get('net_profit_musd', {})
    
    op_margin = fin.setdefault('operating_margin_pct', {})
    net_margin = fin.setdefault('net_margin_pct', {})
    tot_growth = fin.setdefault('total_revenue_growth_pct', {})

    for y, rev in rev_dict.items():
        if rev and rev > 0:
            if y in op_dict and op_dict[y] is not None:
                op_margin[y] = round((op_dict[y] / rev) * 100, 2)
            if y in net_dict and net_dict[y] is not None:
                net_margin[y] = round((net_dict[y] / rev) * 100, 2)

    years = sorted([y for y in rev_dict.keys() if y.isdigit()], key=int)
    for i in range(1, len(years)):
        prev_y = years[i-1]
        curr_y = years[i]
        prev_rev = rev_dict.get(prev_y)
        curr_rev = rev_dict.get(curr_y)
        if prev_rev and curr_rev and prev_rev > 0:
            tot_growth[curr_y] = round(((curr_rev - prev_rev) / prev_rev) * 100, 2)

def main():
    data = load_data()

    # ==========================================
    # 1. TURKISH AIRLINES (TK) - OFFICIAL KAP / IFRS
    # ==========================================
    tk = data.setdefault('TK', {})
    tk_fin = tk.setdefault('financial', {})
    tk_pax = tk.setdefault('passengers', {})

    # Annual Operating Profit corrections (Official KAP 2024: $2.404B, 2025: $2.200B)
    tk_fin['operating_profit_musd']['2024'] = 2404
    tk_fin['operating_profit_musd']['2025'] = 2200
    tk_fin['total_revenue_musd']['2024'] = 22669
    tk_fin['total_revenue_musd']['2025'] = 24096
    tk_fin['passenger_revenue_musd']['2024'] = 18444
    tk_fin['passenger_revenue_musd']['2025'] = 19800
    tk_fin['cargo_revenue_musd']['2024'] = 3495
    tk_fin['cargo_revenue_musd']['2025'] = 3390
    tk_fin['other_revenue_musd']['2024'] = 730
    tk_fin['other_revenue_musd']['2025'] = 906
    tk_fin['net_profit_musd']['2024'] = 3425
    tk_fin['net_profit_musd']['2025'] = 2684

    # Official KAP Passenger & Capacity Data
    tk_pax['passengers']['2024'] = 85171495
    tk_pax['passengers']['2025'] = 92637225
    tk_pax['load_factor_pct']['2024'] = 82.20
    tk_pax['load_factor_pct']['2025'] = 83.19
    tk_pax['fleet_size']['2024'] = 492
    tk_pax['fleet_size']['2025'] = 552
    tk_pax['ask_m']['2024'] = 254120.0
    tk_pax['ask_m']['2025'] = 273231.0
    tk_pax['rpk_m']['2024'] = 208874.0
    tk_pax['rpk_m']['2025'] = 227313.0

    # Official Quarterly 2024 data (KAP / Turkish Airlines IR Disclosures)
    if 'quarterly' in tk and 'financial' in tk['quarterly']:
        q_fin = tk['quarterly']['financial']
        q_fin['total_revenue_musd']['2024-Q1'] = 4770
        q_fin['total_revenue_musd']['2024-Q2'] = 5660
        q_fin['total_revenue_musd']['2024-Q3'] = 6635
        q_fin['total_revenue_musd']['2024-Q4'] = 5604

        q_fin['passenger_revenue_musd']['2024-Q1'] = 3870
        q_fin['passenger_revenue_musd']['2024-Q2'] = 4610
        q_fin['passenger_revenue_musd']['2024-Q3'] = 5600
        q_fin['passenger_revenue_musd']['2024-Q4'] = 4364

        q_fin['cargo_revenue_musd']['2024-Q1'] = 730
        q_fin['cargo_revenue_musd']['2024-Q2'] = 854
        q_fin['cargo_revenue_musd']['2024-Q3'] = 911
        q_fin['cargo_revenue_musd']['2024-Q4'] = 1000

        q_fin['operating_profit_musd']['2024-Q1'] = 150
        q_fin['operating_profit_musd']['2024-Q2'] = 554
        q_fin['operating_profit_musd']['2024-Q3'] = 1300
        q_fin['operating_profit_musd']['2024-Q4'] = 400

        q_fin['net_profit_musd']['2024-Q1'] = 226
        q_fin['net_profit_musd']['2024-Q2'] = 943
        q_fin['net_profit_musd']['2024-Q3'] = 1780
        q_fin['net_profit_musd']['2024-Q4'] = 476

        for q in ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']:
            rev = q_fin['total_revenue_musd'][q]
            q_fin.setdefault('operating_margin_pct', {})[q] = round((q_fin['operating_profit_musd'][q] / rev) * 100, 2)
            q_fin.setdefault('net_margin_pct', {})[q] = round((q_fin['net_profit_musd'][q] / rev) * 100, 2)

        # Official 2026 Q1 & Q2 Turkish Cargo & Financial Disclosures (KAP / IR)
        q_fin['cargo_revenue_musd']['2026-Q1'] = 987
        q_fin['cargo_revenue_musd']['2026-Q2'] = 1267
        q_fin['passenger_revenue_musd']['2026-Q2'] = 5700
        q_fin['total_revenue_musd']['2026-Q2'] = 7205
        q_fin['other_revenue_musd']['2026-Q2'] = 238
        q_fin['operating_profit_musd']['2026-Q2'] = -64
        q_fin['net_profit_musd']['2026-Q2'] = 197
        q_fin.setdefault('operating_margin_pct', {})['2026-Q2'] = round((-64 / 7205) * 100, 2)
        q_fin.setdefault('net_margin_pct', {})['2026-Q2'] = round((197 / 7205) * 100, 2)

    if 'semi_annual' in tk and 'financial' in tk['semi_annual']:
        h_fin = tk['semi_annual']['financial']
        h_fin['total_revenue_musd']['2024-H1'] = 10430
        h_fin['total_revenue_musd']['2024-H2'] = 12239
        h_fin['operating_profit_musd']['2024-H1'] = 704
        h_fin['operating_profit_musd']['2024-H2'] = 1700
        h_fin['net_profit_musd']['2024-H1'] = 1169
        h_fin['net_profit_musd']['2024-H2'] = 2256
        for h in ['2024-H1', '2024-H2']:
            rev = h_fin['total_revenue_musd'][h]
            h_fin.setdefault('operating_margin_pct', {})[h] = round((h_fin['operating_profit_musd'][h] / rev) * 100, 2)
            h_fin.setdefault('net_margin_pct', {})[h] = round((h_fin['net_profit_musd'][h] / rev) * 100, 2)

        # Official 2026 H1 (First 6 Months) Turkish Cargo & Consolidated Financials
        h_fin['cargo_revenue_musd']['2026-H1'] = 2254  # 987M (1Q) + 1267M (2Q)
        h_fin['passenger_revenue_musd']['2026-H1'] = 9878
        h_fin['total_revenue_musd']['2026-H1'] = 12289
        h_fin['operating_profit_musd']['2026-H1'] = 321
        h_fin['net_profit_musd']['2026-H1'] = 504
        h_fin.setdefault('operating_margin_pct', {})['2026-H1'] = round((321 / 12289) * 100, 2)
        h_fin.setdefault('net_margin_pct', {})['2026-H1'] = round((504 / 12289) * 100, 2)

    recalculate_margins_and_growth(tk)

    # ==========================================
    # 2. DELTA AIR LINES (DAL) - SEC 10-K
    # ==========================================
    dal = data.setdefault('DAL', {})
    dal_fin = dal.setdefault('financial', {})
    dal_fin['total_revenue_musd']['2024'] = 61643
    dal_fin['operating_profit_musd']['2024'] = 5995
    dal_fin['net_profit_musd']['2024'] = 3457
    dal_fin['passenger_revenue_musd']['2024'] = 53600
    dal_fin['cargo_revenue_musd']['2024'] = 780
    dal_fin['other_revenue_musd']['2024'] = 7263
    recalculate_margins_and_growth(dal)

    # ==========================================
    # 3. UNITED AIRLINES (UAL) - SEC 10-K
    # ==========================================
    ual = data.setdefault('UAL', {})
    ual_fin = ual.setdefault('financial', {})
    ual_fin['total_revenue_musd']['2024'] = 57063
    ual_fin['operating_profit_musd']['2024'] = 5096
    ual_fin['net_profit_musd']['2024'] = 3149
    ual_fin['passenger_revenue_musd']['2024'] = 51800
    ual_fin['cargo_revenue_musd']['2024'] = 1650
    ual_fin['other_revenue_musd']['2024'] = 3613
    recalculate_margins_and_growth(ual)

    # ==========================================
    # 4. AMERICAN AIRLINES (AAL) - SEC 10-K
    # ==========================================
    aal = data.setdefault('AAL', {})
    aal_fin = aal.setdefault('financial', {})
    aal_fin['total_revenue_musd']['2024'] = 54233
    aal_fin['net_profit_musd']['2024'] = 846
    aal_fin['passenger_revenue_musd']['2024'] = 49450
    aal_fin['cargo_revenue_musd']['2024'] = 800
    aal_fin['other_revenue_musd']['2024'] = 3983
    recalculate_margins_and_growth(aal)

    # ==========================================
    # 5. SOUTHWEST AIRLINES (LUV) - SEC 10-K
    # ==========================================
    luv = data.setdefault('LUV', {})
    luv_fin = luv.setdefault('financial', {})
    luv_fin['total_revenue_musd']['2024'] = 27585
    luv_fin['operating_profit_musd']['2024'] = 321
    luv_fin['net_profit_musd']['2024'] = 465
    luv_fin['passenger_revenue_musd']['2024'] = 24900
    recalculate_margins_and_growth(luv)

    # ==========================================
    # 6. AIR FRANCE-KLM (AF) - Universal Registration Doc
    # ==========================================
    af = data.setdefault('AF', {})
    af_fin = af.setdefault('financial', {})
    af_pax = af.setdefault('passengers', {})
    af_fin['total_revenue_musd']['2024'] = 34100
    af_fin['operating_profit_musd']['2023'] = 1850
    af_fin['operating_profit_musd']['2024'] = 1730
    af_fin['net_profit_musd']['2024'] = 343
    af_pax['passengers']['2023'] = 93600000
    af_pax['passengers']['2024'] = 97900000
    recalculate_margins_and_growth(af)

    # ==========================================
    # 7. LUFTHANSA GROUP (LH) - Annual Report
    # ==========================================
    lh = data.setdefault('LH', {})
    lh_fin = lh.setdefault('financial', {})
    lh_pax = lh.setdefault('passengers', {})
    lh_fin['total_revenue_musd']['2024'] = 40600
    lh_fin['operating_profit_musd']['2024'] = 1780
    lh_fin['net_profit_musd']['2024'] = 1490
    lh_pax['passengers']['2023'] = 122500000
    lh_pax['passengers']['2024'] = 131500000
    recalculate_margins_and_growth(lh)

    # ==========================================
    # 8. INTERNATIONAL AIRLINES GROUP (IAG) - Annual Report
    # ==========================================
    iag = data.setdefault('IAG', {})
    iag_fin = iag.setdefault('financial', {})
    iag_fin['total_revenue_musd']['2024'] = 34800
    iag_fin['operating_profit_musd']['2024'] = 4820
    iag_fin['net_profit_musd']['2024'] = 2960
    recalculate_margins_and_growth(iag)

    # ==========================================
    # 9. PEGASUS AIRLINES (PGSUS) - KAP
    # ==========================================
    pg = data.setdefault('PGSUS', {})
    pg_fin = pg.setdefault('financial', {})
    pg_pax = pg.setdefault('passengers', {})
    pg_fin['total_revenue_musd']['2024'] = 3390
    pg_fin['net_profit_musd']['2024'] = 391
    pg_pax['passengers']['2023'] = 31.9
    pg_pax['passengers']['2024'] = 36.6
    recalculate_margins_and_growth(pg)

    # ==========================================
    # 10. RYANAIR (RYA) - Annual Report
    # ==========================================
    rya = data.setdefault('RYA', {})
    recalculate_margins_and_growth(rya)

    # Save finalized data
    save_data(data)
    print("Successfully corrected official financial figures and recalculations across all carriers!")

if __name__ == '__main__':
    main()
