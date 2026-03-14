import type { Article, Profile, Personnel, TocEntry, Division, Alumni, CampusLocation, GalleryItem } from "@/types";

// --- Student Officer Generator ---

const soFirstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Mohammed", "Sai", "Arnav", "Dhruv",
  "Kabir", "Ritvik", "Aadhya", "Ananya", "Ishita", "Priya", "Kavya", "Shreya", "Tanvi", "Riya",
  "Vikram", "Rajesh", "Sunil", "Pranav", "Harsh", "Nikhil", "Deepak", "Gaurav", "Manish", "Rohit",
  "Sneha", "Pooja", "Neha", "Swati", "Divya", "Ashwin", "Karthik", "Ramesh", "Suresh", "Mohan",
  "Aisha", "Fatima", "Zara", "Sara", "Noor",
];

const soLastNames = [
  "Sharma", "Verma", "Patel", "Kumar", "Singh", "Reddy", "Iyer", "Nair", "Rao", "Deshmukh",
  "Joshi", "Chauhan", "Thakur", "Menon", "Gupta", "Khan", "Patil", "Mishra", "Pandey", "Dubey",
  "Saxena", "Bhatt", "Mehta", "Shah", "Das", "Bose", "Sen", "Roy", "Chowdhury", "Banerjee",
  "Pillai", "Kaur", "Gill", "Sandhu", "Dhillon", "Malhotra", "Kapoor", "Chopra", "Bedi", "Arora",
  "Jadhav", "Kulkarni", "Deshpande", "More", "Pawar",
];

const soRanks: [string, string][] = [
  ["Captain", "Capt"],
  ["Major", "Maj"],
  ["Lieutenant", "Lt"],
];

const soRegiments = [
  "The Rajputana Rifles", "Corps of Engineers", "The Dogra Regiment", "The Sikh Regiment",
  "Army Medical Corps", "The Jat Regiment", "The Grenadiers", "Corps of EME",
  "Army Service Corps", "The Bihar Regiment", "Intelligence Corps", "The Mahar Regiment",
  "The Garhwal Rifles", "The Kumaon Regiment", "Corps of Signals", "The Punjab Regiment",
  "The Maratha Light Infantry", "Army Ordnance Corps", "The Madras Regiment", "The Assam Regiment",
  "The Naga Regiment", "The Parachute Regiment", "The Jammu & Kashmir Rifles", "The Ladakh Scouts",
  "Army Aviation Corps", "Corps of Artillery", "Army Air Defence", "The Rajput Regiment",
  "The Guards", "The Mechanised Infantry",
];

const staffDesignations = [
  "GSO-2 (Intelligence)", "GSO-3 (Operations)", "GSO-3 (Signals)", "DAQMG",
  "BM (Brigade Major)", "Quartermaster", "OC Troops",
  "Instructor (Tactics)", "Instructor (Weapons)", "Instructor (Mil Law)",
  "Instructor (IT & Cyber)", "Instructor (Foreign Languages)",
  "MTO (Motor Transport Officer)", "Mess Secretary",
  "Sports Officer", "Education Officer", "Regimental Medical Officer",
  "Provost Marshal", "Signal Officer", "Intelligence Officer",
  "Welfare Officer", "OC HQ Coy", "Instructor (Physical Training)",
  "Instructor (Military History)", "Instructor (Communication)",
  "Library Officer", "Documentation Officer", "Security Officer",
  "Liaison Officer", "Camp Commandant",
];

const staffRanks: [string, string][] = [
  ["Lt Col", "Lt Col"],
  ["Major", "Maj"],
  ["Captain", "Capt"],
  ["Colonel", "Col"],
];

function generateStaffOfficers(count: number, startId: number): Personnel[] {
  return Array.from({ length: count }, (_, i) => {
    const [rank, prefix] = staffRanks[i % staffRanks.length];
    const firstName = soFirstNames[(i + 10) % soFirstNames.length];
    const lastName = soLastNames[(i + 7) % soLastNames.length];
    return {
      id: `pers-so-${startId + i}`,
      name: `${prefix} ${firstName} ${lastName}`,
      rank,
      designation: staffDesignations[i % staffDesignations.length],
      personnel_role: "staff_officer" as const,
      avatar_url: null,
      unit_or_regiment: soRegiments[(i + 5) % soRegiments.length],
      order: i + 6,
    };
  });
}

function generateStudentOfficers(division: Division, count: number, startId: number): Personnel[] {
  return Array.from({ length: count }, (_, i) => {
    const [rank, prefix] = soRanks[i % soRanks.length];
    return {
      id: `pers-${startId + i}`,
      name: `${prefix} ${soFirstNames[i % soFirstNames.length]} ${soLastNames[i % soLastNames.length]}`,
      rank,
      designation: "Student Officer",
      personnel_role: "student_officer" as const,
      division,
      avatar_url: null,
      unit_or_regiment: soRegiments[i % soRegiments.length],
      order: i + 1,
    };
  });
}

export const sampleProfiles: Profile[] = [
  {
    id: "profile-1",
    full_name: "Chinthu Krishnan V",
    role: "super_editor",
    avatar_url: null,
    created_at: "2024-08-15T10:00:00Z",
    is_active: true,
  },
  {
    id: "profile-2",
    full_name: "Harvinder",
    role: "editor",
    avatar_url: null,
    created_at: "2024-09-01T10:00:00Z",
    is_active: true,
  },
  {
    id: "profile-3",
    full_name: "Kapil",
    role: "contributor",
    avatar_url: null,
    created_at: "2024-10-10T10:00:00Z",
    is_active: true,
  },
];

export const sampleArticles: Article[] = [
  {
    id: "article-1",
    title: "Annual Tech Fest Draws Record Crowd of 3,000 Students",
    slug: "annual-tech-fest-draws-record-crowd",
    excerpt:
      "The three-day technology festival featured 45 events, including a hackathon that saw teams from 12 colleges compete for the grand prize. Student organizers reported a 40% increase in participation over last year.",
    content: null,
    cover_image_url: null,
    category: "Campus",
    tags: ["tech-fest", "events", "hackathon"],
    status: "published",
    is_featured: true,
    author_id: "profile-1",
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-01T09:00:00Z",
    published_at: "2026-03-01T10:00:00Z",
    read_time_minutes: 5,
    author: {
      id: "profile-1",
      full_name: "Chinthu Krishnan V",
      role: "super_editor",
      avatar_url: null,
      created_at: "2024-08-15T10:00:00Z",
      is_active: true,
    },
  },
  {
    id: "article-2",
    title: "Student Research Team Publishes Paper in International Journal",
    slug: "student-research-team-publishes-paper",
    excerpt:
      "A group of final-year students from the Computer Science department had their research on machine learning in agricultural monitoring accepted by the IEEE conference proceedings.",
    content: null,
    cover_image_url: null,
    category: "Achievements",
    tags: ["research", "ieee", "machine-learning"],
    status: "published",
    is_featured: false,
    author_id: "profile-2",
    created_at: "2026-02-20T14:00:00Z",
    updated_at: "2026-02-20T14:00:00Z",
    published_at: "2026-02-21T08:00:00Z",
    read_time_minutes: 4,
    author: {
      id: "profile-2",
      full_name: "Harvinder",
      role: "editor",
      avatar_url: null,
      created_at: "2024-09-01T10:00:00Z",
      is_active: true,
    },
  },
  {
    id: "article-3",
    title: "Why Our Campus Needs Better Mental Health Resources",
    slug: "campus-needs-better-mental-health-resources",
    excerpt:
      "An opinion piece examining the growing demand for counseling services and the administration's response. With exam season approaching, students are calling for extended support hours and peer counseling programs.",
    content: null,
    cover_image_url: null,
    category: "Opinion",
    tags: ["mental-health", "campus-life", "opinion"],
    status: "published",
    is_featured: false,
    author_id: "profile-3",
    created_at: "2026-02-15T11:00:00Z",
    updated_at: "2026-02-15T11:00:00Z",
    published_at: "2026-02-16T09:00:00Z",
    read_time_minutes: 6,
    author: {
      id: "profile-3",
      full_name: "Kapil",
      role: "contributor",
      avatar_url: null,
      created_at: "2024-10-10T10:00:00Z",
      is_active: true,
    },
  },
  {
    id: "article-4",
    title: "Cricket Team Clinches Inter-College Trophy After 5-Year Wait",
    slug: "cricket-team-clinches-inter-college-trophy",
    excerpt:
      "In a nail-biting final against Fergusson College, our cricket team defended a modest total of 156 to win by 12 runs. Captain Vikram Singh's bowling spell of 4-23 sealed the victory.",
    content: null,
    cover_image_url: null,
    category: "Sports",
    tags: ["cricket", "sports", "inter-college"],
    status: "published",
    is_featured: false,
    author_id: "profile-2",
    created_at: "2026-02-10T16:00:00Z",
    updated_at: "2026-02-10T16:00:00Z",
    published_at: "2026-02-11T07:00:00Z",
    read_time_minutes: 3,
    author: {
      id: "profile-2",
      full_name: "Harvinder",
      role: "editor",
      avatar_url: null,
      created_at: "2024-09-01T10:00:00Z",
      is_active: true,
    },
  },
  {
    id: "article-5",
    title: "Cultural Festival Celebrates Regional Diversity with Folk Performances",
    slug: "cultural-festival-celebrates-regional-diversity",
    excerpt:
      "Over 200 students participated in the annual cultural showcase, performing traditional dances and music from Maharashtra, Karnataka, and Gujarat. The event aimed to bridge cultural gaps on campus.",
    content: null,
    cover_image_url: null,
    category: "Culture",
    tags: ["culture", "festival", "performances"],
    status: "published",
    is_featured: false,
    author_id: "profile-1",
    created_at: "2026-02-05T10:00:00Z",
    updated_at: "2026-02-05T10:00:00Z",
    published_at: "2026-02-06T08:00:00Z",
    read_time_minutes: 4,
    author: {
      id: "profile-1",
      full_name: "Chinthu Krishnan V",
      role: "super_editor",
      avatar_url: null,
      created_at: "2024-08-15T10:00:00Z",
      is_active: true,
    },
  },
  {
    id: "article-6",
    title: "New AI Lab Inaugurated with Industry Partnership",
    slug: "new-ai-lab-inaugurated-with-industry-partnership",
    excerpt:
      "The college has opened a state-of-the-art artificial intelligence laboratory in collaboration with a leading tech company, equipped with GPU clusters and datasets for student research projects.",
    content: null,
    cover_image_url: null,
    category: "Tech",
    tags: ["ai", "lab", "technology", "infrastructure"],
    status: "published",
    is_featured: false,
    author_id: "profile-2",
    created_at: "2026-01-28T12:00:00Z",
    updated_at: "2026-01-28T12:00:00Z",
    published_at: "2026-01-29T09:00:00Z",
    read_time_minutes: 5,
    author: {
      id: "profile-2",
      full_name: "Harvinder",
      role: "editor",
      avatar_url: null,
      created_at: "2024-09-01T10:00:00Z",
      is_active: true,
    },
  },
];

export const tickerHeadlines: string[] = sampleArticles.map((a) => a.title);

// --- Personnel Data for Who is Who ---

export const samplePersonnel: Personnel[] = [
  // Commandant
  {
    id: "pers-1",
    name: "Brig Rajesh Kumar Sharma, SM",
    rank: "Brigadier",
    designation: "Commandant, MILIT",
    personnel_role: "commandant",
    avatar_url: null,
    bio: "Brigadier RK Sharma assumed the appointment of Commandant, MILIT in January 2025. An alumnus of the National Defence Academy and Indian Military Academy, he has commanded an infantry battalion along the Line of Control and served in multiple UN peacekeeping missions.",
    unit_or_regiment: "The Garhwal Rifles",
    order: 1,
  },
  // Deputy Commandant
  {
    id: "pers-2",
    name: "Col Anil Mehta, VSM",
    rank: "Colonel",
    designation: "Deputy Commandant, MILIT",
    personnel_role: "deputy_commandant",
    avatar_url: null,
    bio: "Colonel Anil Mehta brings over two decades of distinguished service including tenures in counter-insurgency operations and high-altitude warfare. He oversees the academic and administrative functioning of the institute.",
    unit_or_regiment: "The Kumaon Regiment",
    order: 1,
  },
  // Staff Officers
  {
    id: "pers-3",
    name: "Lt Col Priya Deshmukh",
    rank: "Lt Col",
    designation: "GSO-1 (Training)",
    personnel_role: "staff_officer",
    avatar_url: null,
    unit_or_regiment: "Corps of Signals",
    order: 1,
  },
  {
    id: "pers-4",
    name: "Lt Col Harpreet Singh",
    rank: "Lt Col",
    designation: "GSO-1 (Administration)",
    personnel_role: "staff_officer",
    avatar_url: null,
    unit_or_regiment: "The Punjab Regiment",
    order: 2,
  },
  {
    id: "pers-5",
    name: "Maj Vikram Joshi",
    rank: "Major",
    designation: "GSO-2 (Coordination)",
    personnel_role: "staff_officer",
    avatar_url: null,
    unit_or_regiment: "The Maratha Light Infantry",
    order: 3,
  },
  {
    id: "pers-6",
    name: "Maj Sneha Patil",
    rank: "Major",
    designation: "GSO-2 (Logistics)",
    personnel_role: "staff_officer",
    avatar_url: null,
    unit_or_regiment: "Army Ordnance Corps",
    order: 4,
  },
  {
    id: "pers-7",
    name: "Capt Arjun Nair",
    rank: "Captain",
    designation: "Adjutant",
    personnel_role: "staff_officer",
    avatar_url: null,
    unit_or_regiment: "The Madras Regiment",
    order: 5,
  },
  // Generated Staff Officers (30 more → 35 total)
  ...generateStaffOfficers(30, 6),
  // Student Officers — 45 per division (generated)
  ...generateStudentOfficers("Manekshaw", 45, 8),
  ...generateStudentOfficers("Cariappa", 45, 53),
  ...generateStudentOfficers("Arjan", 45, 98),
  ...generateStudentOfficers("Pereira", 45, 143),
];

// --- Table of Contents Data ---

export const sampleTocEntries: TocEntry[] = [
  {
    id: "toc-1",
    title: "Commandant's Message",
    page_label: "01",
    category: "Leadership",
    type: "feature",
  },
  {
    id: "toc-2",
    title: "Who is Who",
    page_label: "02",
    category: "Leadership",
    type: "section",
  },
  ...sampleArticles.map((article, i) => ({
    id: `toc-art-${article.id}`,
    title: article.title,
    page_label: String(i + 3).padStart(2, "0"),
    category: article.category,
    slug: article.slug,
    type: "article" as const,
  })),
  {
    id: "toc-media",
    title: "Media Vault",
    page_label: String(sampleArticles.length + 3).padStart(2, "0"),
    category: "Media",
    type: "section",
  },
];

// --- Alumni Data for Alumni Spotlight ---

export const sampleAlumni: Alumni[] = [
  {
    id: "alumni-1",
    name: "Col Raghav Menon, SM",
    batch_year: 2012,
    current_role: "Commanding Officer, 4 Rajput",
    organization: "Indian Army",
    career_domain: "military",
    location: "Pathankot, Punjab",
    avatar_url: null,
    quote: "MILIT taught me that leadership is not about rank — it is about earning the trust of every soldier who stands beside you.",
    bio: "Colonel Raghav Menon commanded operations along the Line of Control and was awarded the Sena Medal for gallantry. A distinguished graduate of DSTSC 08, he credits the institute for shaping his operational thinking.",
    is_featured: true,
  },
  {
    id: "alumni-2",
    name: "Maj Ananya Kulkarni",
    batch_year: 2018,
    current_role: "Company Commander, 9 Para (SF)",
    organization: "Indian Army",
    career_domain: "military",
    location: "Agra, UP",
    avatar_url: null,
    quote: "The training grounds here prepared me for realities no classroom ever could.",
    bio: "Major Ananya Kulkarni is one of the first women officers to command a company in a Special Forces battalion. She specializes in high-altitude warfare and counter-terrorism operations.",
    is_featured: false,
  },
  {
    id: "alumni-3",
    name: "Lt Col Harjinder Singh",
    batch_year: 2014,
    current_role: "GSO-2 (Operations), HQ Northern Command",
    organization: "Indian Army",
    career_domain: "military",
    location: "Udhampur, J&K",
    avatar_url: null,
    quote: "Every operational plan I draft traces back to the tactical foundations laid at MILIT.",
    bio: "Lt Col Harjinder Singh served two tenures in Siachen and now coordinates operations at Northern Command HQ. He is a graduate of both DSTSC 08 and the Army War College.",
    is_featured: false,
  },
  {
    id: "alumni-4",
    name: "Maj Devika Nair",
    batch_year: 2019,
    current_role: "Instructor, Officers Training Academy",
    organization: "Indian Army",
    career_domain: "military",
    location: "Chennai, TN",
    avatar_url: null,
    quote: "Passing on what I learned here to the next generation of officers is my greatest privilege.",
    bio: "Major Devika Nair returned to training after a frontline posting with the Corps of Engineers. She now shapes young officers at OTA Chennai, focusing on leadership and fieldcraft.",
    is_featured: false,
  },
  {
    id: "alumni-5",
    name: "Shri Vikram Chauhan, IAS",
    batch_year: 2013,
    current_role: "District Collector, Pune",
    organization: "Government of Maharashtra",
    career_domain: "defense_government",
    location: "Pune, Maharashtra",
    avatar_url: null,
    quote: "Military discipline and public service share the same DNA — selfless commitment.",
    bio: "After a Short Service Commission, Vikram Chauhan cleared the UPSC Civil Services examination and joined the IAS. He now serves as District Collector of Pune, bringing military precision to governance.",
    is_featured: false,
  },
  {
    id: "alumni-6",
    name: "Dr Preethi Reddy",
    batch_year: 2015,
    current_role: "Director, Defence Research & Development",
    organization: "DRDO",
    career_domain: "defense_government",
    location: "Hyderabad, Telangana",
    avatar_url: null,
    quote: "Understanding the soldier's needs firsthand made me a better defence scientist.",
    bio: "Dr Preethi Reddy transitioned from active military service to defence research. She leads a team developing next-generation soldier protection systems at DRDO Hyderabad.",
    is_featured: false,
  },
  {
    id: "alumni-7",
    name: "Arjun Bhatia",
    batch_year: 2016,
    current_role: "VP, Strategy & Operations",
    organization: "Tata Advanced Systems",
    career_domain: "corporate",
    location: "Bengaluru, Karnataka",
    avatar_url: null,
    quote: "The strategic thinking drilled into us at MILIT is my competitive edge in the boardroom.",
    bio: "Arjun Bhatia moved to the defence industry after his Short Service Commission. He now leads strategic partnerships for Tata Advanced Systems, bridging military requirements with corporate solutions.",
    is_featured: false,
  },
  {
    id: "alumni-8",
    name: "Sneha Kapoor",
    batch_year: 2017,
    current_role: "Management Consultant, McKinsey & Company",
    organization: "McKinsey & Company",
    career_domain: "corporate",
    location: "Mumbai, Maharashtra",
    avatar_url: null,
    quote: "Leading a platoon and leading a consulting engagement require the same core skill — clarity under pressure.",
    bio: "After her military tenure, Sneha Kapoor completed an MBA at IIM Ahmedabad and joined McKinsey. She specializes in operations transformation for large enterprises.",
    is_featured: false,
  },
  {
    id: "alumni-9",
    name: "Dr Saurabh Pandey",
    batch_year: 2014,
    current_role: "Associate Professor, Strategic Studies",
    organization: "Jawaharlal Nehru University",
    career_domain: "academic",
    location: "New Delhi",
    avatar_url: null,
    quote: "The best way to honour our training is to ensure the next generation understands why it matters.",
    bio: "Dr Saurabh Pandey pursued a PhD in strategic studies after his military service. He now teaches at JNU's School of International Studies, specializing in South Asian security dynamics.",
    is_featured: false,
  },
  {
    id: "alumni-10",
    name: "Ritu Sharma",
    batch_year: 2020,
    current_role: "Founder & CEO",
    organization: "ShieldTech Solutions",
    career_domain: "entrepreneurship",
    location: "Gurugram, Haryana",
    avatar_url: null,
    quote: "Every startup is a battle — and MILIT trained me to win them.",
    bio: "Ritu Sharma founded ShieldTech Solutions, a cybersecurity startup serving defence and enterprise clients. Her company has secured seed funding and contracts with multiple government agencies.",
    is_featured: false,
  },
];

// --- Campus Map Locations ---

export const sampleCampusLocations: CampusLocation[] = [
  {
    id: "loc-1",
    name: "Main Gate",
    description: "The primary entrance to MILIT campus with round-the-clock security. All visitors report here for verification.",
    fun_fact: "The gate pillars bear the institute motto carved in stone since its founding.",
    x: 10,
    y: 88,
    icon_type: "gate",
  },
  {
    id: "loc-2",
    name: "Parade Ground",
    description: "The heart of the institute where morning assemblies, ceremonial parades, and passing out events are held.",
    fun_fact: "The parade ground can accommodate the entire battalion strength of over 500 personnel in formation.",
    x: 50,
    y: 58,
    icon_type: "field",
  },
  {
    id: "loc-3",
    name: "Academic Block",
    description: "Houses lecture halls, syndicate rooms, and the main auditorium for academic instruction and seminars.",
    x: 35,
    y: 38,
    icon_type: "building",
  },
  {
    id: "loc-4",
    name: "Library & War Studies Centre",
    description: "A comprehensive collection of military history, strategy, and contemporary defence literature.",
    fun_fact: "Contains rare first editions of military treatises dating back to the colonial era.",
    x: 60,
    y: 33,
    icon_type: "building",
  },
  {
    id: "loc-5",
    name: "Officers' Mess",
    description: "The social and dining hub for all officers. Hosts formal mess nights, guest lectures, and social gatherings.",
    x: 75,
    y: 23,
    icon_type: "residential",
  },
  {
    id: "loc-6",
    name: "Sports Complex",
    description: "Multi-sport facility including gymnasium, basketball courts, squash courts, and a 25m swimming pool.",
    fun_fact: "The complex hosts the annual Inter-Division championship where all four divisions compete.",
    x: 25,
    y: 68,
    icon_type: "recreation",
  },
  {
    id: "loc-7",
    name: "Firing Range",
    description: "A 300m classified firing range used for weapons training and annual firing practice assessments.",
    x: 85,
    y: 53,
    icon_type: "field",
  },
  {
    id: "loc-8",
    name: "Medical Inspection Room",
    description: "Provides primary healthcare, annual medical examinations, and emergency medical support for all personnel.",
    x: 15,
    y: 43,
    icon_type: "medical",
  },
  {
    id: "loc-9",
    name: "Quartermaster Stores",
    description: "Central logistics hub for uniform issue, equipment maintenance, and ration distribution.",
    x: 70,
    y: 68,
    icon_type: "building",
  },
  {
    id: "loc-10",
    name: "Accommodation Blocks",
    description: "Four division-wise accommodation blocks — Manekshaw, Cariappa, Arjan, and Pereira — housing all student officers.",
    fun_fact: "Each block is named after a legendary Indian military leader and displays their portrait in the foyer.",
    x: 45,
    y: 18,
    icon_type: "residential",
  },
];

// --- Photo Gallery Items ---

export const sampleGalleryItems: GalleryItem[] = [
  { id: "gal-1", title: "Passing Out Parade 2025", category: "Events", type: "image", aspect_ratio: "landscape", description: "The graduating batch marches in full ceremonial dress under the watchful eyes of the reviewing officer." },
  { id: "gal-2", title: "Morning Assembly Formation", category: "Training", type: "image", aspect_ratio: "landscape", description: "Student officers in perfect formation during the daily morning assembly on the parade ground." },
  { id: "gal-3", title: "Library Study Session", category: "Campus", type: "image", aspect_ratio: "portrait", description: "Officers immersed in study at the War Studies Centre library." },
  { id: "gal-4", title: "Inter-Division Cricket Final", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Manekshaw Division vs Cariappa Division in the annual cricket championship." },
  { id: "gal-5", title: "Commandant Portrait", category: "Portraits", type: "image", aspect_ratio: "portrait", description: "Official portrait of the Commandant in ceremonial uniform." },
  { id: "gal-6", title: "Cultural Night Dance", category: "Cultural", type: "image", aspect_ratio: "square", description: "Vibrant folk dance performance during the annual cultural festival." },
  { id: "gal-7", title: "Firing Range Practice", category: "Training", type: "image", aspect_ratio: "landscape", description: "Annual firing practice assessment at the 300m range." },
  { id: "gal-8", title: "Sunset Over Parade Ground", category: "Campus", type: "image", aspect_ratio: "landscape", description: "A golden sunset casting long shadows across the parade ground." },
  { id: "gal-9", title: "Basketball Tournament", category: "Sports", type: "image", aspect_ratio: "portrait", description: "Action from the inter-division basketball tournament." },
  { id: "gal-10", title: "Guest Lecture Series", category: "Events", type: "image", aspect_ratio: "landscape", description: "Distinguished guests addressing the student body in the main auditorium." },
  { id: "gal-11", title: "Obstacle Course Training", category: "Training", type: "video", aspect_ratio: "landscape", description: "Student officers navigating the challenging obstacle course during physical training." },
  { id: "gal-12", title: "Division Group Photo", category: "Portraits", type: "image", aspect_ratio: "landscape", description: "Pereira Division group photograph outside their accommodation block." },
  { id: "gal-13", title: "Rangoli Competition", category: "Cultural", type: "image", aspect_ratio: "square", description: "Intricate rangoli designs created during the Diwali celebration." },
  { id: "gal-14", title: "Swimming Pool Training", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Swimming practice at the 25m pool in the sports complex." },
  { id: "gal-15", title: "Mess Night Dinner", category: "Events", type: "image", aspect_ratio: "landscape", description: "Formal mess night dinner with officers in their best attire." },
  { id: "gal-16", title: "Main Gate at Dawn", category: "Campus", type: "image", aspect_ratio: "portrait", description: "The iconic main gate of MILIT captured at first light." },
  { id: "gal-17", title: "Map Reading Exercise", category: "Training", type: "image", aspect_ratio: "square", description: "Tactical map reading exercise during a field training session." },
  { id: "gal-18", title: "Band Performance", category: "Cultural", type: "video", aspect_ratio: "landscape", description: "The institute band performing at the annual day celebrations." },
];
