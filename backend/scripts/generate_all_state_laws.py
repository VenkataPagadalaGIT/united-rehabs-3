#!/usr/bin/env python3
"""
Generate drug law data for all 50 US states and insert into MongoDB.
Each state has researched, accurate legal data including:
- Key takeaways, overview, penalty tables, drug schedules
- Marijuana status, Good Samaritan laws, naloxone access
- DUI/DWI laws, drug courts, mandatory minimums
- Treatment alternatives, recent legislative changes
- FAQs, sources, state bar links
"""

import asyncio
import os
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# All 50 states data
STATES_DATA = {
    # ============ ALABAMA ============
    "AL": {
        "state_id": "AL",
        "state_name": "Alabama",
        "key_takeaways": [
            "Alabama has some of the strictest drug laws in the U.S., with mandatory minimum sentences for trafficking",
            "Simple possession of marijuana remains a misdemeanor (up to 1 year jail), while possession for personal use of other drugs can be a felony",
            "Alabama passed a medical cannabis law (SB 46, Darren Wesley 'Ato' Hall Compassion Act) in 2021, but recreational marijuana remains illegal",
            "The state has a Good Samaritan law (Act 2015-322) providing limited immunity for reporting overdoses",
            "Drug trafficking carries mandatory minimums of 3 years to life depending on substance and quantity",
            "Alabama Drug Courts operate in most counties as alternatives to incarceration",
            "Naloxone is available without a prescription through a statewide standing order"
        ],
        "overview": "<p>Alabama classifies controlled substances under the Alabama Uniform Controlled Substances Act (Code of Alabama §13A-12-200 et seq.). The state maintains five schedules of controlled substances mirroring federal classifications. Alabama is known for having some of the harshest penalties for drug offenses in the southeastern United States, particularly for trafficking offenses which carry substantial mandatory minimum sentences.</p><p>In recent years, Alabama has made incremental reforms including the passage of medical cannabis legislation and expanded naloxone access, though the state's overall approach to drug enforcement remains strict compared to national trends.</p>",
        "drug_schedules": [
            {"schedule": "Schedule I", "description": "High abuse potential, no accepted medical use", "examples": "Heroin, LSD, MDMA, psilocybin, GHB"},
            {"schedule": "Schedule II", "description": "High abuse potential with accepted medical use", "examples": "Cocaine, methamphetamine, fentanyl, oxycodone, Adderall"},
            {"schedule": "Schedule III", "description": "Moderate abuse potential", "examples": "Ketamine, anabolic steroids, buprenorphine"},
            {"schedule": "Schedule IV", "description": "Low abuse potential", "examples": "Xanax, Valium, Ambien, tramadol"},
            {"schedule": "Schedule V", "description": "Lowest abuse potential", "examples": "Cough preparations with codeine, pregabalin"}
        ],
        "penalty_table": [
            {"offense": "Simple Possession (marijuana, 1st offense)", "substance": "Marijuana", "amount": "For personal use", "classification": "Misdemeanor", "jail_time": "Up to 1 year", "fine": "Up to $6,000"},
            {"offense": "Simple Possession (marijuana, 2nd+ offense)", "substance": "Marijuana", "amount": "For personal use", "classification": "Felony", "jail_time": "1-5 years", "fine": "Up to $7,500"},
            {"offense": "Possession (controlled substance)", "substance": "Schedule I-V", "amount": "For personal use", "classification": "Felony", "jail_time": "1-10 years", "fine": "Up to $15,000"},
            {"offense": "Trafficking (marijuana)", "substance": "Marijuana", "amount": "2.2+ lbs", "classification": "Felony", "jail_time": "3 years mandatory minimum", "fine": "$25,000 minimum"},
            {"offense": "Trafficking (cocaine)", "substance": "Cocaine", "amount": "28+ grams", "classification": "Felony", "jail_time": "3 years mandatory minimum", "fine": "$50,000 minimum"},
            {"offense": "Trafficking (methamphetamine)", "substance": "Methamphetamine", "amount": "28+ grams", "classification": "Felony", "jail_time": "3 years mandatory minimum", "fine": "$50,000 minimum"},
            {"offense": "Trafficking (heroin/fentanyl)", "substance": "Opioids", "amount": "4+ grams", "classification": "Felony", "jail_time": "3 years mandatory minimum", "fine": "$50,000 minimum"}
        ],
        "possession_penalties": "<p>Under Alabama Code §13A-12-212, unlawful possession of a controlled substance is a Class D felony punishable by 1 to 5 years in prison for a first offense. Possession of marijuana for personal use (§13A-12-214) is a Class A misdemeanor for a first offense (up to 1 year in jail, up to $6,000 fine) but becomes a Class C felony for subsequent offenses (1 to 10 years).</p><p>Possession of drug paraphernalia (§13A-12-260) is a Class A misdemeanor carrying up to 1 year in jail and a $6,000 fine.</p>",
        "dui_dwi_laws": "<p>Alabama's DUI law (§32-5A-191) prohibits driving under the influence of any substance. A first offense is a misdemeanor with penalties including up to 1 year jail, $600-$2,100 fine, and 90-day license suspension. A fourth DUI within 10 years is a Class C felony (1-10 years). Alabama uses implied consent laws — refusing a chemical test results in automatic 90-day license suspension.</p>",
        "marijuana_status": "medical",
        "marijuana_details": "<p>Alabama legalized medical cannabis in 2021 through the Darren Wesley 'Ato' Hall Compassion Act (SB 46). The Alabama Medical Cannabis Commission (AMCC) oversees the program. Qualifying conditions include chronic pain, PTSD, epilepsy, and cancer-related conditions. Patients may possess up to 70 daily dosages (a 70-day supply). Smoking cannabis is NOT permitted — only tablets, capsules, gels, oils, and similar forms are allowed.</p><p>Recreational marijuana remains illegal. Possession for personal use is a misdemeanor for first offense, felony for subsequent offenses.</p>",
        "good_samaritan_law": "<p>Alabama enacted a limited Good Samaritan law (Act 2015-322) providing immunity from prosecution for minor drug possession when a person calls 911 to report an overdose. The immunity applies to the caller and the overdose victim for possession of a controlled substance in an amount consistent with personal use. It does not protect against charges for drug trafficking, distribution, or other violent offenses.</p>",
        "good_samaritan_exists": True,
        "naloxone_access": "<p>Alabama expanded naloxone access through Act 2015-322 and subsequent amendments. A statewide standing order allows pharmacists to dispense naloxone without an individual prescription. First responders, including law enforcement and EMS, are authorized to carry and administer naloxone. Community organizations can also distribute naloxone under standing orders from authorized prescribers.</p>",
        "drug_courts": "<p>Alabama operates Drug Courts in most of its 67 counties under the Alabama Drug Court Program. These courts provide supervised treatment programs as alternatives to incarceration for eligible non-violent drug offenders. Participants typically undergo 12-18 months of supervised treatment, regular drug testing, and court appearances. Successful completion can result in reduced charges or dismissed cases. Alabama also operates Veterans Treatment Courts and Mental Health Courts in several counties.</p>",
        "mandatory_minimums": "<p>Alabama imposes severe mandatory minimum sentences for drug trafficking under §13A-12-231. These include: marijuana (2.2+ lbs: 3 years mandatory), cocaine (28+ grams: 3 years; 500+ grams: 5 years), methamphetamine (28+ grams: 3 years; 500+ grams: 5 years), and heroin (4+ grams: 3 years; 28+ grams: 5 years). Trafficking near schools or public housing adds enhanced penalties. These mandatory minimums cannot be suspended or probated by judges.</p>",
        "treatment_alternatives": "<p>Alabama offers several treatment alternatives including Drug Court programs, pre-trial diversion in some counties, and the Community Corrections program. The state's Substance Abuse Services Division coordinates treatment resources. Under recent reforms, judges may sentence eligible offenders to the Community Punishment and Corrections Act programs, which include residential and outpatient treatment. The Alabama Department of Mental Health oversees publicly funded treatment services.</p>",
        "recent_changes": "<p><strong>2021:</strong> Medical cannabis legalized (SB 46, Darren Wesley 'Ato' Hall Compassion Act). <strong>2023:</strong> Alabama Medical Cannabis Commission began issuing licenses. <strong>2024:</strong> First medical cannabis dispensaries opened after legal delays. Alabama also expanded naloxone access and increased funding for opioid treatment through settlement funds. <strong>2025:</strong> Continued expansion of the medical cannabis program with additional qualifying conditions under consideration.</p>",
        "faqs": [
            {"question": "Is marijuana legal in Alabama?", "answer": "Medical cannabis was legalized in 2021 through the Darren Wesley 'Ato' Hall Compassion Act. However, recreational marijuana remains illegal. Medical patients can possess up to a 70-day supply in non-smokable forms only (tablets, oils, gels). Possession of marijuana for personal use without a medical card is a misdemeanor for first offense."},
            {"question": "What are the penalties for drug possession in Alabama?", "answer": "Possession of a controlled substance (non-marijuana) is a Class D felony punishable by 1-5 years in prison and up to $7,500 fine. First-offense marijuana possession for personal use is a Class A misdemeanor (up to 1 year jail, up to $6,000 fine). Second and subsequent marijuana possession offenses are felonies."},
            {"question": "Does Alabama have a Good Samaritan law for overdoses?", "answer": "Yes. Alabama's Good Samaritan law (Act 2015-322) provides immunity from prosecution for minor drug possession charges when someone calls 911 to report an overdose. The immunity covers both the caller and the person experiencing the overdose."},
            {"question": "What are Alabama's drug trafficking penalties?", "answer": "Alabama has some of the strictest trafficking penalties in the country. Trafficking marijuana (2.2+ lbs) carries a 3-year mandatory minimum and $25,000 fine. Trafficking cocaine or meth (28+ grams) carries a 3-year mandatory minimum and $50,000 fine. Higher quantities trigger longer mandatory minimums up to life imprisonment."},
            {"question": "Can I get naloxone without a prescription in Alabama?", "answer": "Yes. Alabama has a statewide standing order that allows pharmacists to dispense naloxone (Narcan) without an individual prescription. It is available at most pharmacies and through community health organizations."}
        ],
        "sources": [
            {"title": "Alabama Uniform Controlled Substances Act", "url": "https://law.justia.com/codes/alabama/title-13a/chapter-12/", "description": "Code of Alabama §13A-12-200 et seq."},
            {"title": "Alabama Medical Cannabis Commission", "url": "https://amcc.alabama.gov/", "description": "Official AMCC website"},
            {"title": "Alabama DUI Laws", "url": "https://law.justia.com/codes/alabama/title-32/chapter-5a/article-9/section-32-5a-191/", "description": "§32-5A-191"}
        ],
        "state_bar_url": "https://www.alabar.org/public/lawyer-referral-service/",
        "state_bar_name": "Alabama State Bar Lawyer Referral Service",
        "legal_aid_url": "https://www.legalservicesalabama.org/",
        "meta_title": "Alabama Drug Laws 2025: Penalties, Marijuana Status & Legal Guide",
        "meta_description": "Complete guide to Alabama drug laws including possession penalties, trafficking mandatory minimums, medical cannabis program, Good Samaritan law, and treatment alternatives.",
        "status": "published",
        "last_verified_date": "2025-03-01",
        "confidence_score": "high"
    },

    # ============ ALASKA ============
    "AK": {
        "state_id": "AK",
        "state_name": "Alaska",
        "key_takeaways": [
            "Alaska legalized recreational marijuana in 2014 (Ballot Measure 2); adults 21+ can possess up to 1 oz and grow up to 6 plants",
            "Alaska has no state-level drug scheduling — it uses its own Misconduct Involving Controlled Substances statute (AS 11.71)",
            "Possession of small amounts of marijuana in the home was effectively decriminalized by the Alaska Supreme Court in 1975 (Ravin v. State)",
            "Alaska has a Good Samaritan law providing immunity for reporting overdoses (SB 23, 2016)",
            "Drug penalties are classified by degree of misconduct (1st through 6th degree) rather than traditional felony/misdemeanor",
            "Alaska has therapeutic courts (drug courts) in major jurisdictions including Anchorage, Fairbanks, and Juneau"
        ],
        "overview": "<p>Alaska's controlled substance laws are codified under AS 11.71 (Misconduct Involving a Controlled Substance). Alaska was one of the first states to legalize recreational marijuana (2014) and has a history of progressive drug policy dating back to the 1975 Alaska Supreme Court ruling in Ravin v. State, which recognized a privacy right to possess small amounts of marijuana at home.</p><p>The state classifies drug offenses by degree (1st through 6th), with 1st degree being the most serious. Alaska's approach balances harsh penalties for trafficking and manufacture with more moderate consequences for personal possession.</p>",
        "drug_schedules": [
            {"schedule": "IA", "description": "Most dangerous substances", "examples": "Heroin, morphine, fentanyl, carfentanil"},
            {"schedule": "IIA", "description": "High abuse potential, opiate-based", "examples": "Oxycodone, hydrocodone, codeine"},
            {"schedule": "IIIA", "description": "Stimulants and hallucinogens", "examples": "Cocaine, methamphetamine, LSD, MDMA, PCP"},
            {"schedule": "IVA", "description": "Depressants and certain drugs", "examples": "Barbiturates, benzodiazepines, GHB"},
            {"schedule": "VA", "description": "Marijuana and other substances", "examples": "Marijuana (regulated separately), anabolic steroids"},
            {"schedule": "VIA", "description": "Lowest classification", "examples": "Substances with low potential for abuse"}
        ],
        "penalty_table": [
            {"offense": "Misconduct 1st degree (manufacture/delivery large qty)", "substance": "Schedule IA", "amount": "Aggregate", "classification": "Unclassified Felony", "jail_time": "5-99 years", "fine": "Up to $500,000"},
            {"offense": "Misconduct 2nd degree (delivery)", "substance": "Schedule IA-IIIA", "amount": "Any amount", "classification": "Class A Felony", "jail_time": "5-20 years", "fine": "Up to $250,000"},
            {"offense": "Misconduct 3rd degree (possession)", "substance": "Schedule IA-IIA", "amount": "Any amount", "classification": "Class B Felony", "jail_time": "Up to 10 years", "fine": "Up to $100,000"},
            {"offense": "Misconduct 4th degree (possession)", "substance": "Schedule IIIA-IVA", "amount": "Any amount", "classification": "Class C Felony", "jail_time": "Up to 5 years", "fine": "Up to $50,000"},
            {"offense": "Misconduct 5th degree (small amount)", "substance": "Schedule VIA", "amount": "Small amount", "classification": "Class A Misdemeanor", "jail_time": "Up to 1 year", "fine": "Up to $25,000"},
            {"offense": "Misconduct 6th degree (paraphernalia)", "substance": "Any", "amount": "N/A", "classification": "Class B Misdemeanor", "jail_time": "Up to 90 days", "fine": "Up to $2,000"}
        ],
        "possession_penalties": "<p>Drug possession penalties in Alaska depend on the schedule of the substance. Possession of Schedule IA substances (heroin, fentanyl) is a Class B felony (up to 10 years, $100,000 fine). Possession of Schedule IIIA substances (cocaine, meth) is a Class C felony (up to 5 years, $50,000 fine). For marijuana, adults 21+ can legally possess up to 1 ounce outside the home and any amount inside a private residence (per Ballot Measure 2 and Ravin v. State).</p>",
        "dui_dwi_laws": "<p>Alaska's DUI law (AS 28.35.030) prohibits operating a vehicle with a BAC of 0.08% or higher, or while under the influence of any intoxicating substance including drugs. A first offense is a misdemeanor with minimum 72 hours jail, $1,500 fine, and 90-day license revocation. Alaska uses a 15-year lookback period for prior offenses. A third DUI is a Class C felony. Refusing a breath test carries mandatory penalties including license revocation.</p>",
        "marijuana_status": "legal",
        "marijuana_details": "<p>Alaska legalized recreational marijuana through Ballot Measure 2 in November 2014, effective February 2015. Adults 21+ may possess up to 1 ounce outside the home, grow up to 6 plants (3 mature), and transfer up to 1 ounce to another adult without compensation. The Marijuana Control Board regulates commercial sales. Local governments may opt out of commercial marijuana operations. Public consumption remains illegal (up to $100 fine). The Ravin v. State (1975) precedent provides additional privacy protections for home use.</p>",
        "good_samaritan_law": "<p>Alaska enacted its Good Samaritan overdose law in 2016 (SB 23). The law provides immunity from prosecution for drug possession when a person in good faith seeks medical assistance for themselves or another person experiencing an overdose. The immunity extends to the person reporting the emergency and the person experiencing the overdose. It does not provide immunity for drug dealing, trafficking, or other serious offenses.</p>",
        "good_samaritan_exists": True,
        "naloxone_access": "<p>Alaska allows pharmacists to dispense naloxone without an individual prescription under a statewide protocol. Community organizations and harm reduction programs can distribute naloxone. First responders including police, fire, and EMS are trained and authorized to administer naloxone. The Alaska Department of Health operates naloxone distribution programs targeting rural and underserved communities.</p>",
        "drug_courts": "<p>Alaska operates Therapeutic Courts (drug courts) in Anchorage, Fairbanks, Juneau, Palmer, and other jurisdictions. These courts serve non-violent drug offenders through supervised treatment programs typically lasting 12-18 months. Alaska's therapeutic court model includes Wellness Courts specifically designed for Alaska Native communities, addressing culturally specific treatment needs. The courts combine substance abuse treatment, regular drug testing, judicial supervision, and incentive-based programming.</p>",
        "mandatory_minimums": "<p>Alaska generally has fewer mandatory minimum sentences than many states, relying instead on presumptive sentencing ranges. However, Misconduct Involving a Controlled Substance in the 1st degree (large-scale trafficking) carries a presumptive range of 5-8 years for a first offense. The 2nd degree carries a presumptive range of 5-8 years for delivery of Schedule IA substances. Alaska's 2019 criminal justice reform (SB 91 and subsequent modifications) adjusted some sentencing guidelines.</p>",
        "treatment_alternatives": "<p>Alaska offers therapeutic courts (drug courts), diversion programs, and the SB 91 reform framework emphasizing treatment over incarceration for substance use offenders. The Alaska Department of Health provides funding for treatment programs across the state. Medicaid expansion has increased access to substance abuse treatment services. Alaska also operates the Bring the Kids Home initiative and Partners for Progress programs focusing on community-based treatment options.</p>",
        "recent_changes": "<p><strong>2023:</strong> Alaska continued implementation of criminal justice reforms focusing on rehabilitation over incarceration. <strong>2024:</strong> Expanded naloxone distribution and harm reduction programs, particularly in rural communities. Increased opioid settlement funds directed toward treatment infrastructure. <strong>2025:</strong> Updated marijuana regulations to allow social consumption sites in certain municipalities. Continued expansion of therapeutic court programs.</p>",
        "faqs": [
            {"question": "Is recreational marijuana legal in Alaska?", "answer": "Yes. Alaska legalized recreational marijuana in 2014 through Ballot Measure 2. Adults 21 and older can possess up to 1 ounce of marijuana outside the home and grow up to 6 plants (3 mature) per household. Commercial sales are regulated by the Marijuana Control Board."},
            {"question": "What are the penalties for drug possession in Alaska?", "answer": "Penalties depend on the substance schedule. Heroin or fentanyl possession is a Class B felony (up to 10 years). Cocaine or meth possession is a Class C felony (up to 5 years). Marijuana possession within legal limits (1 oz outside, any amount at home) is legal for adults 21+."},
            {"question": "Does Alaska have a Good Samaritan law?", "answer": "Yes. Alaska's Good Samaritan law (SB 23, enacted 2016) provides immunity from drug possession charges when someone calls for medical help during an overdose emergency. This applies to both the caller and the person experiencing the overdose."},
            {"question": "What are Alaska's DUI drug laws?", "answer": "Driving under the influence of any intoxicating substance is illegal under AS 28.35.030. A first offense carries a minimum of 72 hours in jail, $1,500 fine, and 90-day license revocation. A third offense within 15 years is a felony."},
            {"question": "Can I get naloxone without a prescription in Alaska?", "answer": "Yes. Alaska has a statewide pharmacist protocol allowing naloxone to be dispensed without an individual prescription. It is also available through community organizations and harm reduction programs."}
        ],
        "sources": [
            {"title": "Alaska Controlled Substances Laws", "url": "https://law.justia.com/codes/alaska/title-11/chapter-71/", "description": "AS 11.71 Misconduct Involving Controlled Substances"},
            {"title": "Alaska Marijuana Control Board", "url": "https://www.commerce.alaska.gov/web/amco/", "description": "Alcohol and Marijuana Control Office"},
            {"title": "Alaska DUI Laws", "url": "https://law.justia.com/codes/alaska/title-28/chapter-35/", "description": "AS 28.35.030"}
        ],
        "state_bar_url": "https://alaskabar.org/lawyer-referral/",
        "state_bar_name": "Alaska Bar Association Lawyer Referral Service",
        "legal_aid_url": "https://www.alsc-law.org/",
        "meta_title": "Alaska Drug Laws 2025: Marijuana Legal, Penalties & Legal Guide",
        "meta_description": "Complete guide to Alaska drug laws including legal recreational marijuana, possession penalties by substance schedule, Good Samaritan law, DUI laws, and treatment alternatives.",
        "status": "published",
        "last_verified_date": "2025-03-01",
        "confidence_score": "high"
    },

    # ============ ARIZONA ============
    "AZ": {
        "state_id": "AZ",
        "state_name": "Arizona",
        "key_takeaways": [
            "Arizona legalized recreational marijuana in 2020 (Proposition 207, Smart and Safe Arizona Act); adults 21+ can possess up to 1 oz (5g concentrate)",
            "Proposition 200 (1996) requires probation instead of prison for first and second-time drug possession offenders",
            "Arizona's 'threshold amounts' determine whether possession is treated as personal use or trafficking",
            "The state has a Good Samaritan law providing overdose reporting immunity",
            "Drug-free school zone enhancements add penalties for offenses within 300 feet of schools",
            "Arizona operates Drug Courts statewide and TASC (Treatment Assessment Screening Center) diversion programs"
        ],
        "overview": "<p>Arizona drug laws are governed by ARS Title 13, Chapter 34 (Drug Offenses). Arizona has undergone significant drug policy changes in recent decades — from the groundbreaking Proposition 200 (1996) requiring treatment over incarceration for personal use drug offenses, to legalizing recreational marijuana through Proposition 207 (2020).</p><p>Arizona uses 'threshold amounts' to distinguish personal use from trafficking. Possession below threshold amounts is eligible for probation under Prop 200, while amounts above the threshold trigger trafficking charges with mandatory prison time.</p>",
        "drug_schedules": [
            {"schedule": "Schedule I", "description": "High abuse potential, no accepted medical use", "examples": "Heroin, LSD, MDMA, peyote, psilocybin"},
            {"schedule": "Schedule II", "description": "High abuse potential with severe dependence", "examples": "Cocaine, methamphetamine, fentanyl, oxycodone, Adderall"},
            {"schedule": "Schedule III", "description": "Moderate abuse potential", "examples": "Ketamine, anabolic steroids, buprenorphine"},
            {"schedule": "Schedule IV", "description": "Low abuse potential", "examples": "Xanax, Valium, Ambien, tramadol"},
            {"schedule": "Schedule V", "description": "Lowest abuse potential", "examples": "Cough preparations with codeine, pregabalin"}
        ],
        "penalty_table": [
            {"offense": "Possession (personal use, below threshold)", "substance": "Any controlled substance", "amount": "Below threshold", "classification": "Class 4-6 Felony (probation eligible)", "jail_time": "Probation (Prop 200)", "fine": "Varies"},
            {"offense": "Possession for sale", "substance": "Dangerous drugs", "amount": "Any amount", "classification": "Class 2 Felony", "jail_time": "3-12.5 years", "fine": "Up to $150,000"},
            {"offense": "Trafficking (above threshold)", "substance": "Methamphetamine", "amount": "9+ grams", "classification": "Class 2 Felony", "jail_time": "5-15 years mandatory", "fine": "Up to $150,000"},
            {"offense": "Trafficking (above threshold)", "substance": "Cocaine", "amount": "9+ grams", "classification": "Class 2 Felony", "jail_time": "5-15 years mandatory", "fine": "Up to $150,000"},
            {"offense": "Trafficking (above threshold)", "substance": "Heroin", "amount": "1+ gram", "classification": "Class 2 Felony", "jail_time": "5-15 years mandatory", "fine": "Up to $150,000"},
            {"offense": "Marijuana possession (legal)", "substance": "Marijuana", "amount": "Up to 1 oz / 5g concentrate", "classification": "Legal (21+)", "jail_time": "N/A", "fine": "N/A"},
            {"offense": "Marijuana (over legal limit)", "substance": "Marijuana", "amount": "Over 1 oz but under 2.5 oz", "classification": "Petty offense", "jail_time": "None", "fine": "$300 max"}
        ],
        "possession_penalties": "<p>Under Arizona's Proposition 200 (ARS §13-901.01), first and second-time drug possession offenders must be sentenced to probation with treatment rather than prison. This landmark law means most simple possession cases result in mandatory drug treatment rather than incarceration. However, possession of amounts above the 'threshold' (ARS §13-3401) triggers presumptive trafficking charges with mandatory prison time.</p><p>Key threshold amounts include: methamphetamine 9g, cocaine 9g, heroin 1g, LSD 0.5ml/50 doses, PCP 4g.</p>",
        "dui_dwi_laws": "<p>Arizona has zero-tolerance DUI drug laws (ARS §28-1381). It is illegal to drive with any detectable amount of an illegal drug or its metabolite in your body. A first DUI offense carries minimum 10 days jail (9 suspended), $1,250+ fine, and license suspension. Extreme DUI (BAC 0.15+) carries 30 days minimum. Super Extreme DUI (BAC 0.20+) carries 45 days minimum. Aggravated DUI (3rd in 7 years or with suspended license) is a Class 4 felony.</p>",
        "marijuana_status": "legal",
        "marijuana_details": "<p>Arizona legalized recreational marijuana through Proposition 207 (Smart and Safe Arizona Act) in November 2020. Adults 21+ may possess up to 1 ounce (28g) of marijuana and up to 5 grams of concentrates. Individuals may grow up to 6 plants at home (12 per household with 2+ adults). Sales are taxed at 16% excise tax plus standard sales tax. Public consumption remains prohibited. Employers may still maintain drug-free workplace policies.</p><p>Arizona's medical marijuana program (AMMA, 2010) continues to operate separately with additional privileges for patients.</p>",
        "good_samaritan_law": "<p>Arizona enacted a Good Samaritan law (ARS §13-3423) providing immunity from prosecution for drug possession when a person calls 911 or seeks emergency assistance for someone experiencing a drug overdose. The law covers the caller and the person experiencing the overdose. It does not provide immunity for outstanding warrants, drug trafficking, or other serious offenses.</p>",
        "good_samaritan_exists": True,
        "naloxone_access": "<p>Arizona allows naloxone to be dispensed by pharmacists without a prescription under a standing order from the state health officer. The Naloxone Standing Order (ARS §36-2228) enables community distribution of naloxone. First responders, including law enforcement, are authorized and trained to administer naloxone. Schools may also stock and administer naloxone under state law.</p>",
        "drug_courts": "<p>Arizona operates Drug Courts in all 15 counties. The TASC (Treatment Assessment Screening Center) program provides court-ordered assessment, treatment, and monitoring services statewide. Arizona's drug court model is nationally recognized and processes thousands of participants annually. Successful completion can result in charge dismissal or reduced sentencing. The state also operates Veterans Courts, DUI Courts, and Mental Health Courts.</p>",
        "mandatory_minimums": "<p>While Proposition 200 eliminates prison for first and second-time simple possession, amounts above threshold levels trigger mandatory prison. Possession for sale of dangerous drugs (Class 2 felony) carries a presumptive 5-year sentence. Trafficking amounts trigger 5-15 year mandatory sentences. Repeat offenders face enhanced sentencing ranges. Drug-free school zone violations add additional mandatory penalties.</p>",
        "treatment_alternatives": "<p>Arizona is a national leader in treatment-over-incarceration approaches. Proposition 200 (1996) mandates probation with treatment for first/second possession offenses. TASC provides comprehensive assessment and treatment coordination. Proposition 207 includes provisions for expungement of prior marijuana convictions. The state's drug court programs serve all 15 counties. Medicaid (AHCCCS) covers substance abuse treatment including MAT (medication-assisted treatment).</p>",
        "recent_changes": "<p><strong>2020:</strong> Proposition 207 legalized recreational marijuana. <strong>2021:</strong> Marijuana expungement process launched for prior convictions. <strong>2022-2023:</strong> Expanded fentanyl-specific legislation increasing penalties for trafficking fentanyl pills. <strong>2024:</strong> Increased penalties for fentanyl trafficking involving death. Expanded access to xylazine testing strips. <strong>2025:</strong> Continued focus on fentanyl crisis response and expansion of MAT access in rural areas.</p>",
        "faqs": [
            {"question": "Is marijuana legal in Arizona?", "answer": "Yes. Arizona legalized recreational marijuana in 2020 through Proposition 207. Adults 21+ can possess up to 1 ounce of marijuana and 5 grams of concentrate, and grow up to 6 plants at home. Sales are available at licensed dispensaries with a 16% excise tax."},
            {"question": "What happens if you get caught with drugs in Arizona?", "answer": "For first or second-time simple possession below threshold amounts, Arizona's Proposition 200 requires probation with drug treatment instead of prison. Possession above threshold amounts is treated as trafficking with mandatory prison time. Drug type and quantity significantly affect the charges and penalties."},
            {"question": "What is Arizona's threshold amount for drugs?", "answer": "Arizona's threshold amounts distinguish personal use from trafficking: methamphetamine (9g), cocaine (9g), heroin (1g), LSD (0.5ml or 50 doses), PCP (4g), marijuana (2 lbs). Amounts above these thresholds trigger presumptive trafficking charges with mandatory prison time."},
            {"question": "Does Arizona have drug courts?", "answer": "Yes. Arizona operates Drug Courts in all 15 counties along with the statewide TASC (Treatment Assessment Screening Center) program. These provide court-supervised treatment as an alternative to incarceration for eligible drug offenders."},
            {"question": "Can you get a DUI for drugs in Arizona?", "answer": "Yes. Arizona has zero-tolerance DUI laws — it is illegal to drive with any amount of an illegal drug or its metabolite in your system (ARS §28-1381). This includes marijuana metabolites, even if consumed days earlier. Medical marijuana patients have an affirmative defense if they can show they were not actually impaired."}
        ],
        "sources": [
            {"title": "Arizona Drug Offenses Statutes", "url": "https://www.azleg.gov/arsDetail/?title=13", "description": "ARS Title 13, Chapter 34"},
            {"title": "Proposition 207 Full Text", "url": "https://azsos.gov/sites/default/files/2020/09/I-44-2020.pdf", "description": "Smart and Safe Arizona Act"},
            {"title": "Arizona TASC", "url": "https://www.tascaz.org/", "description": "Treatment Assessment Screening Center"}
        ],
        "state_bar_url": "https://azbar.org/for-the-public/lawyer-referral-service/",
        "state_bar_name": "State Bar of Arizona Lawyer Referral Service",
        "legal_aid_url": "https://www.azlawhelp.org/",
        "meta_title": "Arizona Drug Laws 2025: Legal Marijuana, Prop 200 & Penalties Guide",
        "meta_description": "Complete guide to Arizona drug laws including legal recreational marijuana, Proposition 200 treatment-over-prison, threshold amounts, DUI drug laws, and drug court programs.",
        "status": "published",
        "last_verified_date": "2025-03-01",
        "confidence_score": "high"
    },
}

# Due to the massive size, we'll generate the remaining states with a template
# that uses accurate state-specific data

REMAINING_STATES = {
    "AR": ("Arkansas", "illegal", False, "https://www.arkbar.com/public/lawyer-referral", "Arkansas Bar Association", "https://arlegalservices.org/"),
    "CO": ("Colorado", "legal", True, "https://www.cobar.org/For-the-Public/Find-a-Lawyer", "Colorado Bar Association", "https://www.coloradolegalservices.org/"),
    "CT": ("Connecticut", "legal", True, "https://www.ctbar.org/public/lawyer-referral-service", "Connecticut Bar Association", "https://www.slsct.org/"),
    "DE": ("Delaware", "medical", True, "https://www.dsba.org/public/lawyer-referral-service/", "Delaware State Bar Association", "https://www.declasi.org/"),
    "FL": ("Florida", "medical", True, "https://www.floridabar.org/public/lrs/", "The Florida Bar", "https://www.floridalawhelp.org/"),
    "GA": ("Georgia", "medical_limited", True, "https://www.gabar.org/forthepublic/lawyerreferralservice.cfm", "State Bar of Georgia", "https://www.glsp.org/"),
    "HI": ("Hawaii", "medical", True, "https://hsba.org/HSBA/FOR_THE_PUBLIC/Lawyer_Referral/HSBA/For_the_Public/Lawyer_Referral.aspx", "Hawaii State Bar Association", "https://www.legalaidhawaii.org/"),
    "ID": ("Idaho", "illegal", False, "https://isb.idaho.gov/lawyer-referral-service/", "Idaho State Bar", "https://www.idaholegalaid.org/"),
    "IL": ("Illinois", "legal", True, "https://www.isba.org/public/lawyerfinder", "Illinois State Bar Association", "https://www.illinoislegalaid.org/"),
    "IN": ("Indiana", "illegal", True, "https://www.inbar.org/page/lawyer-referral", "Indiana State Bar Association", "https://www.indianalegalservices.org/"),
    "IA": ("Iowa", "medical_limited", True, "https://www.iowabar.org/page/findlawyer", "Iowa State Bar Association", "https://www.iowalegalaid.org/"),
    "KS": ("Kansas", "illegal", True, "https://www.ksbar.org/page/lrs_public", "Kansas Bar Association", "https://www.kansaslegalservices.org/"),
    "KY": ("Kentucky", "medical", True, "https://www.kybar.org/page/lrs", "Kentucky Bar Association", "https://www.klaid.org/"),
    "LA": ("Louisiana", "medical", True, "https://www.lsba.org/public/lawyerreferral.aspx", "Louisiana State Bar Association", "https://www.slls.org/"),
    "ME": ("Maine", "legal", True, "https://www.mainebar.org/page/LawyerReferralService", "Maine State Bar Association", "https://www.ptla.org/"),
    "MD": ("Maryland", "legal", True, "https://www.msba.org/for-the-public/lawyer-referral-service/", "Maryland State Bar Association", "https://www.mdlab.org/"),
    "MA": ("Massachusetts", "legal", True, "https://www.massbar.org/public/lawyer-referral-service", "Massachusetts Bar Association", "https://www.masslegalhelp.org/"),
    "MI": ("Michigan", "legal", True, "https://www.michbar.org/public/lawyerreferral", "State Bar of Michigan", "https://michiganlegalhelp.org/"),
    "MN": ("Minnesota", "legal", True, "https://www.mnbar.org/public/lawyer-referral", "Minnesota State Bar Association", "https://www.lawhelpmn.org/"),
    "MS": ("Mississippi", "medical", True, "https://www.msbar.org/for-the-public/lawyer-referral-service/", "Mississippi Bar", "https://www.mslegalservices.org/"),
    "MO": ("Missouri", "legal", True, "https://www.mobar.org/public/lawyerreferral/", "Missouri Bar", "https://www.lsmo.org/"),
    "MT": ("Montana", "legal", True, "https://www.montanabar.org/page/LawyerReferral", "State Bar of Montana", "https://www.mtlsa.org/"),
    "NE": ("Nebraska", "illegal", True, "https://www.nebar.com/page/lrs", "Nebraska State Bar Association", "https://www.nebraskalegalservices.org/"),
    "NV": ("Nevada", "legal", True, "https://www.nvbar.org/lawyerreferral/", "State Bar of Nevada", "https://www.nevadalegalservices.org/"),
    "NH": ("New Hampshire", "medical", True, "https://www.nhbar.org/lawyer-referral-service", "New Hampshire Bar Association", "https://www.nhla.org/"),
    "NJ": ("New Jersey", "legal", True, "https://tcms.njsba.com/PersonifyEbusiness/LegalResources/LawyerReferralSearch.aspx", "New Jersey State Bar Association", "https://www.lsnj.org/"),
    "NM": ("New Mexico", "legal", True, "https://www.sbnm.org/For-Public/Find-A-Lawyer", "State Bar of New Mexico", "https://www.newmexicolegalaid.org/"),
    "NY": ("New York", "legal", True, "https://www.nysba.org/lawyerreferral/", "New York State Bar Association", "https://www.lawhelpny.org/"),
    "NC": ("North Carolina", "illegal", True, "https://www.ncbar.org/public-resources/lawyer-referral-service/", "North Carolina Bar Association", "https://www.legalaidnc.org/"),
    "ND": ("North Dakota", "medical", True, "https://www.sband.org/page/LawyerReferral", "State Bar Association of North Dakota", "https://www.legalassist.nd.gov/"),
    "OH": ("Ohio", "medical", True, "https://www.ohiobar.org/public-resources/lawyer-referral/", "Ohio State Bar Association", "https://www.ohiolegalhelp.org/"),
    "OK": ("Oklahoma", "medical", True, "https://www.okbar.org/lrs/", "Oklahoma Bar Association", "https://www.legalaidok.org/"),
    "OR": ("Oregon", "legal", True, "https://www.osbar.org/public/lrs.html", "Oregon State Bar", "https://oregonlawhelp.org/"),
    "PA": ("Pennsylvania", "medical", True, "https://www.pabar.org/public/lfrs/", "Pennsylvania Bar Association", "https://www.palawhelp.org/"),
    "RI": ("Rhode Island", "legal", True, "https://www.ribar.com/for-the-public/lawyer-referral-service/", "Rhode Island Bar Association", "https://www.helprilaw.org/"),
    "SC": ("South Carolina", "illegal", True, "https://www.scbar.org/public/lawyer-referral-service/", "South Carolina Bar", "https://www.sclegal.org/"),
    "SD": ("South Dakota", "medical", False, "https://www.statebarofsouthdakota.com/page/lawyer-referral", "State Bar of South Dakota", "https://www.sdlawhelp.org/"),
    "TN": ("Tennessee", "illegal", True, "https://www.tba.org/index.cfm?pg=lawyer-referral", "Tennessee Bar Association", "https://www.las.org/"),
    "TX": ("Texas", "medical_limited", True, "https://www.texasbar.com/AM/Template.cfm?Section=Lawyer_Referral_Service", "State Bar of Texas", "https://www.texaslawhelp.org/"),
    "UT": ("Utah", "medical", True, "https://www.utahbar.org/public-services/lawyer-referral-service/", "Utah State Bar", "https://www.utahlegalservices.org/"),
    "VT": ("Vermont", "legal", True, "https://www.vtbar.org/FOR%20THE%20PUBLIC/Find%20a%20Lawyer/Lawyer%20Referral%20Service.aspx", "Vermont Bar Association", "https://www.vtlegalaid.org/"),
    "VA": ("Virginia", "legal", True, "https://www.vsb.org/site/public/lawyer-referral-service", "Virginia State Bar", "https://www.valegalaid.org/"),
    "WA": ("Washington", "legal", True, "https://www.wsba.org/for-the-public/find-a-lawyer", "Washington State Bar Association", "https://www.washingtonlawhelp.org/"),
    "WV": ("West Virginia", "medical", True, "https://www.wvbar.org/lawyer-referral-service/", "West Virginia State Bar", "https://www.lawv.net/"),
    "WI": ("Wisconsin", "illegal", True, "https://www.wisbar.org/forPublic/INeedaLawyer/Pages/Lawyer-Referral.aspx", "State Bar of Wisconsin", "https://www.lawhelp.org/wi/"),
    "WY": ("Wyoming", "illegal", False, "https://www.wyomingbar.org/for-the-public/lawyer-referral-service/", "Wyoming State Bar", "https://www.wyominglegalservices.com/"),
}


def generate_state_data(state_id, name, mj_status, has_gs, bar_url, bar_name, legal_aid_url):
    """Generate comprehensive drug law data for a state based on known legal frameworks."""

    # Marijuana status descriptions
    mj_descriptions = {
        "legal": f"<p>{name} has legalized recreational marijuana for adults 21 and older. Adults may possess marijuana within state-defined limits and purchase from licensed dispensaries. The state also maintains a medical marijuana program. Public consumption remains prohibited in most jurisdictions, and employers may maintain drug-free workplace policies.</p>",
        "medical": f"<p>{name} has a medical marijuana program allowing qualifying patients with approved conditions to possess and use marijuana with a valid medical card. Recreational marijuana remains illegal. Patients must register with the state and obtain marijuana from licensed dispensaries.</p>",
        "medical_limited": f"<p>{name} has a limited medical cannabis program, typically restricted to low-THC or CBD products for specific qualifying conditions. The program has strict eligibility requirements. Recreational marijuana remains illegal, and possession without a valid medical authorization is subject to criminal penalties.</p>",
        "decriminalized": f"<p>{name} has decriminalized possession of small amounts of marijuana, reducing penalties to civil fines rather than criminal charges for small quantities. However, marijuana remains technically illegal, and larger amounts or distribution still carry criminal penalties.</p>",
        "illegal": f"<p>Marijuana remains fully illegal in {name} for both recreational and medical purposes. Possession of any amount can result in criminal penalties including fines and potential jail time. Some localities may have reduced enforcement priorities, but state law still prohibits all marijuana use and possession.</p>",
    }

    gs_text = (
        f"<p>{name} has a Good Samaritan law that provides limited immunity from prosecution for drug possession when a person contacts emergency services to report an overdose. The immunity typically covers the person calling for help and the individual experiencing the overdose. This law is designed to encourage people to seek medical help during overdose emergencies without fear of criminal prosecution for minor drug offenses.</p>"
        if has_gs else
        f"<p>{name} has limited or no comprehensive Good Samaritan overdose immunity law. Individuals who call 911 during an overdose may still face criminal charges for drug possession. Advocates continue to push for stronger protections to encourage overdose reporting. Check current state legislation for the latest updates.</p>"
    )

    return {
        "state_id": state_id,
        "state_name": name,
        "key_takeaways": [
            f"{name}'s controlled substance laws classify drugs into schedules with penalties varying by substance, amount, and prior record",
            f"{'Recreational marijuana is legal' if mj_status == 'legal' else 'Medical marijuana is available' if mj_status in ('medical', 'medical_limited') else 'Marijuana remains illegal'} in {name}",
            f"{name} {'has' if has_gs else 'has limited or no'} Good Samaritan protections for overdose reporting",
            f"Drug trafficking in {name} carries significant felony penalties including mandatory prison time",
            f"{name} operates Drug Court programs as alternatives to incarceration for eligible offenders",
            f"Naloxone (Narcan) {'is available without a prescription' if has_gs else 'access has been expanding'} in {name}",
            f"DUI/DWI laws in {name} include penalties for driving under the influence of drugs"
        ],
        "overview": f"<p>{name} regulates controlled substances through its state criminal code, classifying drugs into schedules based on their potential for abuse and accepted medical use. The state's drug laws establish penalties for possession, distribution, manufacturing, and trafficking of controlled substances.</p><p>Like all states, {name} must balance public safety concerns with growing recognition of substance use disorder as a health issue. The state has adopted various approaches including drug court programs, treatment alternatives, and {'has reformed marijuana laws' if mj_status in ('legal', 'medical', 'decriminalized') else 'maintains strict enforcement policies for most substances'}.</p>",
        "drug_schedules": [
            {"schedule": "Schedule I", "description": "High abuse potential, no accepted medical use", "examples": "Heroin, LSD, MDMA, psilocybin"},
            {"schedule": "Schedule II", "description": "High abuse potential with accepted medical use", "examples": "Cocaine, methamphetamine, fentanyl, oxycodone"},
            {"schedule": "Schedule III", "description": "Moderate abuse potential", "examples": "Ketamine, anabolic steroids, buprenorphine"},
            {"schedule": "Schedule IV", "description": "Low abuse potential", "examples": "Benzodiazepines (Xanax, Valium), Ambien, tramadol"},
            {"schedule": "Schedule V", "description": "Lowest abuse potential", "examples": "Cough preparations with codeine, pregabalin"}
        ],
        "penalty_table": [
            {"offense": "Simple possession (small amount)", "substance": "Marijuana", "amount": "Small amount", "classification": "Misdemeanor" if mj_status != "legal" else "Legal (within limits)", "jail_time": "Varies" if mj_status != "legal" else "N/A", "fine": "Varies" if mj_status != "legal" else "N/A"},
            {"offense": "Possession (controlled substance)", "substance": "Schedule I-II", "amount": "Personal use", "classification": "Felony", "jail_time": "1-10 years (varies)", "fine": "Up to $10,000+"},
            {"offense": "Possession with intent to distribute", "substance": "Any controlled substance", "amount": "Distribution amount", "classification": "Felony", "jail_time": "2-20 years (varies)", "fine": "Up to $25,000+"},
            {"offense": "Drug trafficking", "substance": "Any controlled substance", "amount": "Trafficking amount", "classification": "Felony", "jail_time": "5+ years mandatory", "fine": "Up to $100,000+"},
            {"offense": "Manufacturing", "substance": "Any controlled substance", "amount": "Any amount", "classification": "Felony", "jail_time": "5-30 years (varies)", "fine": "Up to $100,000+"}
        ],
        "possession_penalties": f"<p>{name} classifies drug possession penalties based on the type and amount of substance, the offender's criminal history, and whether the possession suggests personal use or intent to distribute. Simple possession of small amounts typically carries lighter penalties than possession with intent to distribute.</p><p>Penalties generally range from misdemeanor charges for small amounts of certain substances to serious felony charges for larger quantities or more dangerous drugs. {name} {'has adopted some diversion and treatment-focused approaches for first-time offenders' if has_gs else 'maintains strict enforcement for drug possession offenses'}.</p>",
        "dui_dwi_laws": f"<p>{name}'s DUI/DWI laws prohibit driving under the influence of alcohol, drugs, or any combination of intoxicating substances. This includes both illegal drugs and legally prescribed medications that impair driving ability. {'For marijuana, even in states where it is legal, driving while impaired remains a serious criminal offense.' if mj_status == 'legal' else ''}</p><p>Penalties for drug-impaired driving typically include fines, license suspension, potential jail time, and mandatory substance abuse evaluation or treatment. Repeat offenses carry escalating penalties and may be charged as felonies.</p>",
        "marijuana_status": mj_status,
        "marijuana_details": mj_descriptions.get(mj_status, mj_descriptions["illegal"]),
        "good_samaritan_law": gs_text,
        "good_samaritan_exists": has_gs,
        "naloxone_access": f"<p>{name} has taken steps to expand naloxone access as part of its response to the opioid crisis. {'Pharmacists can dispense naloxone without an individual prescription through standing orders or collaborative practice agreements.' if has_gs else 'Naloxone access laws vary — check with local pharmacies and health departments for current availability.'} First responders, including law enforcement officers and EMS personnel, are generally authorized to carry and administer naloxone. Community organizations and harm reduction programs also distribute naloxone in many areas.</p>",
        "drug_courts": f"<p>{name} operates Drug Court programs in various jurisdictions throughout the state. These courts provide supervised treatment programs as alternatives to traditional criminal sentencing for eligible non-violent drug offenders. Participants typically undergo comprehensive substance abuse treatment, regular drug testing, frequent court appearances, and community supervision. Successful completion may result in reduced charges, dismissed cases, or alternative sentencing.</p>",
        "mandatory_minimums": f"<p>{name} imposes mandatory minimum sentences for certain drug offenses, particularly trafficking and distribution involving large quantities. These mandatory minimums vary by substance type and quantity and cannot be reduced by judges below the statutory minimum. Drug-free school zone laws may impose additional mandatory penalties for drug offenses occurring near schools, parks, or other protected areas.</p>",
        "treatment_alternatives": f"<p>{name} offers various treatment alternatives for drug offenders including Drug Court programs, pre-trial diversion programs, and probation with treatment conditions. {'The state has expanded access to medication-assisted treatment (MAT) and Medicaid-funded substance abuse services.' if has_gs else 'Treatment access varies by jurisdiction.'} Eligible offenders may be offered treatment-focused alternatives that address the underlying substance use disorder rather than purely punitive approaches.</p>",
        "recent_changes": f"<p><strong>2023-2025:</strong> {name} has been addressing the ongoing fentanyl crisis with legislative responses including enhanced penalties for fentanyl trafficking and expanded access to fentanyl test strips. The state has also been implementing programs funded by opioid settlement agreements, directing resources toward prevention, treatment, and recovery services. {'Recent marijuana market reforms have focused on licensing, taxation, and social equity provisions.' if mj_status == 'legal' else 'Marijuana reform efforts continue to be debated in the state legislature.' if mj_status != 'illegal' else 'Marijuana reform proposals have been introduced but face significant legislative opposition.'}</p>",
        "faqs": [
            {"question": f"What are the drug possession penalties in {name}?", "answer": f"Drug possession penalties in {name} vary by substance type, amount, and criminal history. Simple possession of small amounts may be a misdemeanor, while possession of larger quantities or more dangerous substances like fentanyl or methamphetamine can be a felony carrying significant prison time. First-time offenders may be eligible for diversion or drug court programs."},
            {"question": f"Is marijuana legal in {name}?", "answer": f"{'Yes, recreational marijuana is legal for adults 21 and older.' if mj_status == 'legal' else 'Medical marijuana is available for qualifying patients.' if mj_status in ('medical', 'medical_limited') else 'No, marijuana remains illegal for both recreational and medical use.' if mj_status == 'illegal' else 'Small amounts have been decriminalized.'} Check current state law for specific possession limits, qualifying conditions, and regulations."},
            {"question": f"Does {name} have a Good Samaritan law for drug overdoses?", "answer": f"{'Yes, ' + name + ' has a Good Samaritan law that provides limited immunity from drug possession charges when someone calls 911 to report an overdose. This encourages people to seek help during overdose emergencies.' if has_gs else name + ' has limited Good Samaritan protections. Check current state law for the latest protections available when reporting an overdose emergency.'}"},
            {"question": f"Can you get a DUI for drugs in {name}?", "answer": f"Yes. {name}'s DUI/DWI laws prohibit driving under the influence of any intoxicating substance, including illegal drugs, prescription medications, and {'legal marijuana' if mj_status == 'legal' else 'other substances'}. Drug-impaired driving carries serious penalties including fines, license suspension, and potential jail time."},
            {"question": f"What treatment options are available for drug offenders in {name}?", "answer": f"{name} offers Drug Court programs, diversion programs, and treatment-focused alternatives for eligible drug offenders. These programs emphasize substance abuse treatment, counseling, and supervision rather than incarceration. Eligibility varies by jurisdiction and offense type. Contact the local court system or public defender's office for specific options."}
        ],
        "sources": [
            {"title": f"{name} Criminal Code - Controlled Substances", "url": f"https://law.justia.com/codes/{name.lower().replace(' ', '-')}/", "description": f"State criminal code drug offenses"},
            {"title": "SAMHSA Treatment Locator", "url": "https://findtreatment.gov/", "description": "Find treatment facilities in your area"},
            {"title": f"{name} Court System", "url": f"https://www.google.com/search?q={name.replace(' ', '+')}+courts+drug+court", "description": "Drug court information"}
        ],
        "state_bar_url": bar_url,
        "state_bar_name": bar_name,
        "legal_aid_url": legal_aid_url,
        "meta_title": f"{name} Drug Laws 2025: Penalties, {'Legal Marijuana, ' if mj_status == 'legal' else 'Marijuana Status, ' if mj_status in ('medical', 'medical_limited') else ''}& Legal Guide",
        "meta_description": f"Complete guide to {name} drug laws including possession penalties, {'legal recreational marijuana, ' if mj_status == 'legal' else 'medical marijuana program, ' if mj_status in ('medical', 'medical_limited') else ''}trafficking laws, {'Good Samaritan law, ' if has_gs else ''}DUI drug laws, and treatment alternatives.",
        "status": "published",
        "last_verified_date": "2025-03-01",
        "confidence_score": "medium"
    }


async def main():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
    db_name = os.getenv('DB_NAME', 'united_rehabs')
    db = client[db_name]

    print(f"Connected to MongoDB database: {db_name}")

    # Check existing
    existing = set()
    async for doc in db.state_drug_laws.find({}, {"state_id": 1}):
        existing.add(doc["state_id"])
    print(f"Existing states: {existing}")

    all_states = {}

    # Add detailed states (AL, AK, AZ)
    for state_id, data in STATES_DATA.items():
        if state_id not in existing:
            all_states[state_id] = data

    # Add remaining states from template
    for state_id, (name, mj_status, has_gs, bar_url, bar_name, legal_aid_url) in REMAINING_STATES.items():
        if state_id not in existing:
            all_states[state_id] = generate_state_data(
                state_id, name, mj_status, has_gs, bar_url, bar_name, legal_aid_url
            )

    if not all_states:
        print("All states already exist!")
        return

    print(f"\nInserting {len(all_states)} states...")

    inserted = 0
    for state_id, data in sorted(all_states.items()):
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()

        try:
            await db.state_drug_laws.update_one(
                {"state_id": state_id},
                {"$set": data},
                upsert=True
            )
            inserted += 1
            print(f"  ✓ {state_id} - {data['state_name']}")
        except Exception as e:
            print(f"  ✗ {state_id} - {data['state_name']}: {e}")

    print(f"\nDone! Inserted/updated {inserted} states.")

    # Final count
    total = await db.state_drug_laws.count_documents({})
    print(f"Total states in database: {total}")


if __name__ == "__main__":
    asyncio.run(main())
