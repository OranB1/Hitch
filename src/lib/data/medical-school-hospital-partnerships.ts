// Medical school -> partnered/affiliated NHS teaching hospitals + GP practices, for restricting
// Layer 2 marketplace opportunities to a student's actual placement network rather than all of
// London. London medical schools only so far (user request, 2026-08-04). Other UK medical
// schools not yet researched.
//
// Each entry is sourced from the medical school's or NHS trust's own official pages (not
// secondary/ranking sites) via a dedicated research pass per school. Re-verify before treating as
// exhaustive: placement networks change year to year, and several schools (KCL, QMUL, Imperial)
// also place students at a long tail of GP practices too numerous to name individually; those are
// captured as an aggregate description instead of a fabricated list.

export type HospitalPartnership = {
  medSchool: string; // must match a value in UK_MEDICAL_SCHOOLS (uk-medical-schools.ts)
  status: "operational" | "pre_launch"; // pre_launch schools have no students to place yet
  primaryTrusts: string[];
  hospitals: string[];
  gpPartnershipNote: string; // named practices where published, else an honest "not enumerated" note
  otherNotes?: string;
  sourceUrls: string[];
};

export const LONDON_MED_SCHOOL_HOSPITAL_PARTNERSHIPS: HospitalPartnership[] = [
  {
    medSchool: "Imperial College London",
    status: "operational",
    primaryTrusts: ["Imperial College Healthcare NHS Trust"],
    hospitals: [
      "Charing Cross Hospital",
      "Hammersmith Hospital",
      "Queen Charlotte's and Chelsea Hospital",
      "St Mary's Hospital",
      "Western Eye Hospital",
      "Chelsea and Westminster Hospital",
      "Royal Brompton Hospital",
      "Harefield Hospital",
      "West Middlesex University Hospital",
      "Northwick Park Hospital",
      "Ealing Hospital",
      "St Mark's Hospital",
      "Central Middlesex Hospital",
      "Hillingdon Hospital",
    ],
    gpPartnershipNote:
      "150+ partner GP practices, concentrated in North-West, West and South-West London; individual practices not publicly named.",
    otherNotes: "Imperial's own placement list states it 'is not intended to be exhaustive.'",
    sourceUrls: [
      "https://www.imperial.ac.uk/study/courses/undergraduate/medicine/",
      "https://www.imperial.ac.uk/visit/campuses/nw-london-hospitals/",
      "https://www.imperial.ac.uk/school-public-health/primary-care-and-public-health/teaching/undergrad/",
    ],
  },
  {
    medSchool: "King's College London",
    status: "operational",
    primaryTrusts: [
      "Guy's and St Thomas' NHS Foundation Trust",
      "King's College Hospital NHS Foundation Trust",
    ],
    hospitals: [
      "Guy's Hospital",
      "St Thomas' Hospital",
      "King's College Hospital",
      "University Hospital Lewisham",
      "Queen Elizabeth Hospital (Woolwich)",
      "Croydon University Hospital",
      "Princess Royal University Hospital",
      "Eastbourne District General Hospital",
      "Conquest Hospital (Hastings)",
      "Tunbridge Wells Hospital",
      "William Harvey Hospital (Ashford)",
      "Queen Elizabeth the Queen Mother Hospital (Margate)",
      "Medway Maritime Hospital",
      "Darent Valley Hospital (Dartford)",
      "Maidstone Hospital",
      "Great Western Hospital (Swindon)",
    ],
    gpPartnershipNote: "350+ partner GP practices across south-east England; individual practices not publicly named.",
    otherNotes:
      "Mental health placements at South London & Maudsley NHS FT (SLaM), Oxleas NHS FT, and Kent and Medway NHS and Social Care Partnership Trust. Great Western Hospital (Swindon) is via the KCL/University of Portsmouth partnership MBBS route.",
    sourceUrls: [
      "https://www.kcl.ac.uk/lsm/assets/kcl-gkt-placement-map-april-2024.pdf",
      "https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs",
      "https://www.guysandstthomas.nhs.uk/about-us/our-partners/teaching-and-training",
    ],
  },
  {
    medSchool: "University College London (UCL)",
    status: "operational",
    primaryTrusts: ["University College London Hospitals NHS Foundation Trust", "Royal Free London NHS Foundation Trust"],
    hospitals: [
      "University College Hospital",
      "Royal Free Hospital",
      "Whittington Hospital",
      "Barnet Hospital",
      "North Middlesex University Hospital",
      "Chase Farm Hospital",
      "Great Ormond Street Hospital",
    ],
    gpPartnershipNote:
      "No individual practices named. Year 5 core GP placement (6 weeks) and Year 6 GP placement (4 weeks) in an allocated practice; practices recruited on a rolling basis. No aggregate count published.",
    otherNotes:
      "No single 'primary' trust: four central clinical sites (UCH, Royal Free, Whittington, and 'BMX' = Barnet + North Middlesex, added Sept 2023). Royal Free, Barnet, Chase Farm and North Middlesex all merged into Royal Free London NHS FT on 1 Jan 2025. West Hertfordshire Teaching Hospitals NHS Trust is also a partner (accredited Dec 2021, Paediatrics/O&G, 5th year) but specific hospital names under that trust weren't confirmed for UCL specifically in this pass.",
    sourceUrls: [
      "https://www.ucl.ac.uk/medical-sciences/divisions/medical-school/about-us/campuses",
      "https://www.ucl.ac.uk/medical-sciences/news/2023/nov/ucl-medical-school-welcomes-west-hertfordshire-teaching-hospitals-nhs-trust",
      "https://www.royalfree.nhs.uk/news/royal-free-london-and-north-middlesex-university-hospital-to-merge-1-january-2025",
    ],
  },
  {
    medSchool: "Queen Mary University of London (Barts)",
    status: "operational",
    primaryTrusts: ["Barts Health NHS Trust"],
    hospitals: [
      "The Royal London Hospital",
      "St Bartholomew's Hospital",
      "Whipps Cross University Hospital",
      "Newham University Hospital",
      "Homerton Hospital",
      "King George Hospital",
      "Queen's Hospital (Romford)",
      "Southend Hospital",
      "Colchester Hospital",
      "Princess Alexandra Hospital (Harlow)",
    ],
    gpPartnershipNote:
      "No individual practices named. Year 1 group GP tutorials fortnightly through to a Year 5 eight-week GP apprenticeship, across City & Hackney, Tower Hamlets, Newham, Waltham Forest, Barking & Dagenham, Havering and Redbridge (this region list came via aggregated search, not a single verbatim page, worth re-checking directly on qmul.ac.uk).",
    otherNotes:
      "Royal London, St Bartholomew's, Whipps Cross and Newham are Barts Health's confirmed 'core four'. Homerton, King George and Queen's sit under different trusts (Homerton Healthcare NHS FT; BHRUT) despite being confirmed in-firm sites. Mental health placements (Year 4) at East London NHS FT and North East London NHS FT.",
    sourceUrls: [
      "https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2026/medicine-5-year-programme/",
      "https://educationacademy.bartshealth.nhs.uk/our-teams/medical-education-undergraduate/",
      "https://www.qmul.ac.uk/hub/medicine/explore-our-campuses/",
    ],
  },
  {
    medSchool: "City St George's, University of London",
    status: "operational",
    primaryTrusts: ["St George's University Hospitals NHS Foundation Trust"],
    hospitals: [
      "St George's Hospital",
      "Epsom Hospital",
      "St Helier Hospital",
      "Kingston Hospital",
      "Moorfields Eye Hospital at St George's",
      "South West London Elective Orthopaedic Centre (Epsom)",
      "Frimley Park Hospital",
      "Springfield University Hospital",
      "Queen Mary's Hospital (Roehampton)",
    ],
    gpPartnershipNote:
      "No individual practices named or aggregate count published. F-Year students get a 5-week GP Assistantship (hub-and-spoke model); T-Year students get a 5-week placement (17-19 primary-care sessions).",
    otherNotes:
      "Croydon University Hospital appears repeatedly on secondary/ranking sites as a placement site but could not be confirmed on an official university or trust page this pass. Treat as unverified, not fact.",
    sourceUrls: [
      "https://www.stgeorges.nhs.uk/wp-content/uploads/2025/10/MBBS-Teaching-Standards-for-Clinical-Placements-2025-FINAL.pdf",
      "https://www.epsom-sthelier.nhs.uk/hospital-group/",
      "https://www.citystgeorges.ac.uk/prospective-students/courses/undergraduate/medicine",
    ],
  },
  {
    medSchool: "Brunel University of London",
    status: "operational",
    primaryTrusts: ["The Hillingdon Hospitals NHS Foundation Trust"],
    hospitals: [
      "Hillingdon Hospital",
      "Mount Vernon Hospital",
      "St Bernard's Hospital",
      "Northwick Park Hospital",
      "St Mark's Hospital",
      "Frimley Park Hospital",
      "Heatherwood Hospital",
      "Wexham Park Hospital",
      "Royal Brompton Hospital",
      "Harefield Hospital",
      "Watford General Hospital",
      "St Albans City Hospital",
      "Hemel Hempstead Hospital",
    ],
    gpPartnershipNote:
      "Hillingdon Primary Care Confederation, 43 named GP practices in the London Borough of Hillingdon. Primary care placements start in Year 1.",
    otherNotes:
      "New medical school: first intake (international students) September 2022; first UK 'home' student intake September 2024 (50 places). GMC-approved to recruit, with University of Buckingham Medical School as contingency partner pending full accreditation through to first-cohort graduation, standard for a new school, doesn't affect eventual GMC registration.",
    sourceUrls: [
      "https://www.brunel.ac.uk/brunel-medical-school/clinical-placements",
      "https://www.brunel.ac.uk/news-and-events/news/articles/Brunel-MBBS-places-2024",
    ],
  },
  {
    medSchool: "St Mary's University, Twickenham",
    status: "pre_launch",
    primaryTrusts: [],
    hospitals: [],
    gpPartnershipNote: "Not applicable yet: first cohort has not started.",
    otherNotes:
      "First intake September 2026 (this cycle): no students to place yet as of this pass. Delivered via St Mary's new 'London School of Medicine' using University of Lancashire's (formerly UCLan) MBBS curriculum as contingency/curriculum partner; if St Mary's doesn't secure full GMC accreditation in time, enrolled students transfer to University of Lancashire to complete a GMC-recognised degree. Placements are described only broadly (SW/West London, Surrey, Berkshire, NHS hospitals, GP practices, hospices, charities) with no named list published, consistent with pre-launch status. Re-check GMC's own 'new schools and programmes under review' page once it starts teaching.",
    sourceUrls: [
      "https://www.stmarys.ac.uk/courses/undergraduate/mbbs-medicine-degree",
      "https://www.stmarys.ac.uk/news/2025/st-marys-london-school-of-medicine-to-open-in-september-2026",
      "https://www.gmc-uk.org/education/how-we-quality-assure-education-and-training/approving-education-and-training/institutions-awarding-uk-medical-degrees/new-schools-and-programmes-under-review",
    ],
  },
];
