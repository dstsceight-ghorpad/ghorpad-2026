import type { Article, Profile, Personnel, TocEntry, Division, Alumni, CampusLocation, GalleryItem } from "@/types";

// --- Personnel Photo URL Helper ---
// Note: Supabase Free Plan does NOT support image transforms (returns 503).
// Serve raw URLs and rely on pre-compressed uploads + browser caching.
export function getPersonnelPhotoUrl(personnelId: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/personnel-photos/${personnelId}.jpg`;
}

// --- Service derivation from rank ---
/** Derive the parent service from an officer's rank */
function deriveService(rank: string): "Indian Army" | "Indian Navy" | "Indian Air Force" | "Indian Coast Guard" {
  const r = rank.toLowerCase().trim();
  // Coast Guard ranks
  if (r.startsWith("comdt") || r.startsWith("dy comdt")) return "Indian Coast Guard";
  // Navy ranks
  if (["cdr", "capt(in)", "lt cdr"].some((nr) => r.startsWith(nr.toLowerCase()))) return "Indian Navy";
  // Air Force ranks
  if (["wg cdr", "sqn ldr", "gp capt", "flt lt", "air"].some((ar) => r.startsWith(ar.toLowerCase()))) return "Indian Air Force";
  // Everything else is Army (Major, Lt Col, Col, Brigadier, etc.)
  return "Indian Army";
}

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
      service: deriveService(rank),
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
      service: deriveService(rank),
      order: i + 1,
    };
  });
}

// Build student officers from real nominal roll data [name, rank, unit(ignored)]
function buildSO(
  division: Division,
  prefix: string,
  data: [string, string, string][]
): Personnel[] {
  return data.map(([name, rank], i) => ({
    id: `pers-${prefix}-${i + 1}`,
    name,
    rank,
    designation: "Student Officer",
    personnel_role: "student_officer" as const,
    division,
    avatar_url: null,
    service: deriveService(rank),
    order: i + 1,
  }));
}

// Build student officers with extended profile data (bio, birthday, spouse, etc.)
interface SOProfile {
  name: string; rank: string; unit: string;
  bio?: string; birthday?: string; spouse_name?: string; spouse_birthday?: string;
  anniversary?: string;
}
function buildSOExt(division: Division, prefix: string, data: SOProfile[]): Personnel[] {
  return data.map((d, i) => {
    const id = `pers-${prefix}-${i + 1}`;
    return {
    id,
    name: d.name,
    rank: d.rank,
    designation: "Student Officer",
    personnel_role: "student_officer" as const,
    division,
    avatar_url: getPersonnelPhotoUrl(id),
    service: deriveService(d.rank),
    order: i + 1,
    ...(d.bio && { bio: d.bio }),
    ...(d.birthday && { birthday: d.birthday }),
    ...(d.spouse_name && { spouse_name: d.spouse_name }),
    ...(d.spouse_birthday && { spouse_birthday: d.spouse_birthday }),
    ...(d.anniversary && { anniversary: d.anniversary }),
  };});
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

// Articles are now fetched from Supabase — this array is kept for similarity checking only
export const sampleArticles: Article[] = [];

export const tickerHeadlines: string[] = [
  "She Loves Me, She Loves Me Not — Wg Cdr Shivam Trivedi",
  "Mantra Behind Longevity: Be a Traveller",
  "A Ride to Nowhere… That Took Us Everywhere — Sqn Ldr Sumit Singh Sidhu",
  "The Girinagar Grind: A Scholar-Warrior's Guide to the DSTSC",
  "When Protocol Takes Flight: The Salute No General Saw",
  "Confessions of a Battle-Weary Laptop — Wg Cdr Rahul Nair",
  "A Wife Between Bugles and Dreams — Mrs Maitri",
  "The Khadakwasla Crucible",
  "Life at MILIT – In Step, Out of Step, Together!!!!",
  "The Uniformed Innovators",
];

// --- Personnel Data for Who is Who ---

const _rawPersonnel: Personnel[] = [
  // Commandant
  {
    id: "pers-1",
    name: "V Ganapathy, NM",
    rank: "Rear Admiral",
    designation: "Commandant, MILIT",
    personnel_role: "commandant",
    avatar_url: "/personnel/commandant.jpeg",
    bio: "Rear Admiral V Ganapathy, NM assumed the appointment of Commandant, MILIT. A distinguished officer of the Indian Navy, he has served in various operational and staff appointments across the fleet, bringing a wealth of experience in naval strategy and technology management to the institute.",
    service: "Indian Navy",
    order: 1,
  },
  // Deputy Commandant
  {
    id: "pers-2",
    name: "Saurabh Bhargava",
    rank: "Brigadier",
    designation: "Deputy Commandant & Chief Instructor, MILIT",
    personnel_role: "deputy_commandant",
    avatar_url: null,
    bio: "Brigadier Saurabh Bhargava serves as the Deputy Commandant and Chief Instructor at MILIT. He oversees the academic and administrative functioning of the institute, ensuring the highest standards of military education and training.",
    service: "Indian Army",
    order: 1,
  },
  // ══════════════════════════════════════════════════════════════════════════
  // STAFF OFFICERS — Real Nominal Roll
  // ══════════════════════════════════════════════════════════════════════════

  // ── Commandant Sectt ──
  {
    id: "pers-so-1",
    name: "Paresh Dhasmana",
    rank: "Cdr",
    designation: "SO to Commandant",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "This ever smiling, composed Naval DS is known for his passion for golf, approachable nature, notorious for bashing the weekdays through memes and love for his family. Whether mentoring the SOs or perfecting his swing on the greens, he brings energy and warmth to the campus.",
    service: "Indian Navy",
    birthday: "15 Oct",
    spouse_name: "Mrs Vinita Joshi",
    spouse_birthday: "04 Mar",
    anniversary: "27 May",
    order: 1,
  },

  // ── Training Coordination ──
  {
    id: "pers-so-2",
    name: "G Mahesh Kumar",
    rank: "Gp Capt",
    designation: "Col GS (Trg Coord)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A true officer and a gentleman with a repository of immense experience and knowledge. Known for his calm and composed demeanor even in most stressful situations. He is DS Coord of the Institute. His leadership bridges technological advancements with defence strategies, shaping future officers for national security challenges.",
    service: "Indian Air Force",
    birthday: "13 Jul",
    spouse_name: "Mrs Sunitha",
    spouse_birthday: "26 Oct",
    anniversary: "08 Dec",
    order: 2,
  },
  {
    id: "pers-so-3",
    name: "Ramesh S Bhat",
    rank: "Capt(IN)",
    designation: "Col Trg",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 3,
  },
  {
    id: "pers-so-4",
    name: "Ramesh Prakash",
    rank: "Lt Col",
    designation: "GSO-1 (Coord)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A sincere and professional Mechanised Infantry officer, he is known for his unwavering dedication and positive demeanor. Always willing to go the extra mile, he approaches every assignment with a strong sense of responsibility, ensuring both individual and team success.",
    service: "Indian Army",
    birthday: "16 Jul",
    spouse_name: "Mrs Dibya",
    spouse_birthday: "02 Jun",
    anniversary: "03 Jul",
    order: 4,
  },
  {
    id: "pers-so-5",
    name: "Alok Tomer",
    rank: "Lt Col",
    designation: "GSO-1 (Trg Support)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A tall, smart, happy and josh type officer who firmly believes that coordination and collaboration is the key to success. He serves as a Directing Staff (DS) at MILIT, where he mentors and trains future military leaders in advanced technological and strategic disciplines.",
    service: "Indian Army",
    birthday: "10 Nov",
    spouse_name: "Mrs Swati",
    spouse_birthday: "11 Dec",
    anniversary: "24 Jan",
    order: 5,
  },

  // ── 'A' Division (Army Studies) ──
  {
    id: "pers-so-6",
    name: "RP Singh",
    rank: "Col",
    designation: "HoD 'A' Division",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Col RP Singh is a 2000 batch officer who took over the mantle of HoF A Div in 2024. Besides his mandatory Army courses, the officer has acquired his M Tech from IIT Delhi, where he bagged accolades from Indian Institute of Industrial Engineers in the form of a Cash Award for securing highest CGPA amongst all the M Tech students. He has also acquired a certification from IIM Kozikode in AI & Data Science.",
    service: "Indian Army",
    birthday: "15 Dec",
    spouse_name: "Mrs Neha",
    spouse_birthday: "01 Aug",
    anniversary: "20 Jan",
    order: 6,
  },
  {
    id: "pers-so-7",
    name: "Ravi Tomar",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 7,
  },
  {
    id: "pers-so-8",
    name: "GM Tripathi",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 8,
  },
  {
    id: "pers-so-9",
    name: "V Lakhanpal",
    rank: "Wg Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 9,
  },
  {
    id: "pers-so-10",
    name: "Vishal Kapoor",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Lt Col Vishal Kapoor is a distinguished officer serving as directing staff at MILIT. With expertise in lasers and fiber optics, he plays a crucial role in shaping the technical acumen of defense personnel. An avid sportsman who loves to play racket sports.",
    service: "Indian Army",
    birthday: "09 Sep",
    spouse_name: "Mrs Nidhi Kapoor",
    spouse_birthday: "23 Aug",
    anniversary: "09 Mar",
    order: 10,
  },
  {
    id: "pers-so-11",
    name: "Robin Panicker",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 11,
  },
  {
    id: "pers-so-12",
    name: "Abhijeet Sawant",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 12,
  },
  {
    id: "pers-so-13",
    name: "Gagan Deep Dhaliwal",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 13,
  },

  // ── 'B' Division (Naval Studies) ──
  {
    id: "pers-so-14",
    name: "Sumit Joshi",
    rank: "Capt(IN)",
    designation: "HoD 'B' Division",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Known to be a stickler for discipline, the officer is a third Generation defence officer and is also an alumnus of DSTSC. He has had varied experience in the Navy including some of the most challenging appointments onboard latest warships and at Naval and Command HQs.",
    service: "Indian Navy",
    birthday: "03 Feb",
    spouse_name: "Mrs Bindu",
    spouse_birthday: "20 Nov",
    anniversary: "21 Jun",
    order: 14,
  },
  {
    id: "pers-so-15",
    name: "RK Bhardwaj",
    rank: "Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Cdr Ravi Bhardwaj is a dedicated officer who believes in working silently yet effectively. He values meaningful connections and strives to make a positive impact on those around him. Quiet in action but strong in resolve, he leads with dedication, letting his work speak louder than words.",
    service: "Indian Navy",
    birthday: "29 Apr",
    spouse_name: "Maj Kajri",
    spouse_birthday: "07 Jul",
    anniversary: "18 Feb",
    order: 15,
  },
  {
    id: "pers-so-16",
    name: "Suhrit Bhatia",
    rank: "Lt Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 16,
  },
  {
    id: "pers-so-17",
    name: "Nikhil Tomar",
    rank: "Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A straightforward individual who firmly believes in the saying, 'A leader leads by example.' Soft-spoken yet assertive, he holds trustworthiness in the highest regard. As an instructor, he is committed to the idea that knowledge leads to true empowerment.",
    service: "Indian Navy",
    birthday: "25 May",
    spouse_name: "Mrs Shatakshi Sengar",
    spouse_birthday: "29 Jun",
    anniversary: "25 Nov",
    order: 17,
  },
  {
    id: "pers-so-18",
    name: "Asif Sarkhawas",
    rank: "Capt(IN)",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 18,
  },
  {
    id: "pers-so-19",
    name: "Manish Dahiya",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A Para officer, armament expert, and true 'Mech Head,' he has an impressive list of key qualifications, including the OAAE, GTO, and Rescue Diver courses. A dedicated instructor, he has imparted his knowledge to both DSTSC and NTSC courses since joining MILIT.",
    service: "Indian Army",
    birthday: "18 May",
    spouse_name: "Mrs Aastha Dahiya",
    spouse_birthday: "18 May",
    anniversary: "27 Jan",
    order: 19,
  },
  {
    id: "pers-so-20",
    name: "Deepak Kashyap",
    rank: "Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 20,
  },
  {
    id: "pers-so-21",
    name: "Sachin Tyagi",
    rank: "Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 21,
  },
  {
    id: "pers-so-22",
    name: "Manish Sharma",
    rank: "Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 22,
  },

  // ── 'C' Division (Air Force Studies) ──
  {
    id: "pers-so-23",
    name: "Pandurang M Nibandhe",
    rank: "Gp Capt",
    designation: "HoD 'C' Division",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 23,
  },
  {
    id: "pers-so-24",
    name: "AS Virdi",
    rank: "Gp Capt(TS)",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 24,
  },
  {
    id: "pers-so-25",
    name: "PM Abhyankar",
    rank: "Gp Capt",
    designation: "Adjutant",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A Fighter Controller in the Indian Air Force, he is a highly skilled officer responsible for airspace management, directing fighter aircraft during missions. As an instructor at MILIT, he trains officers in radar operations, tactical interception, and battle management systems.",
    service: "Indian Air Force",
    birthday: "11 Dec",
    spouse_name: "Mrs Smita P Abhyankar",
    spouse_birthday: "03 Jul",
    anniversary: "22 Apr",
    order: 25,
  },
  {
    id: "pers-so-26",
    name: "BP Tripathy",
    rank: "Wg Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 26,
  },
  {
    id: "pers-so-27",
    name: "Rachit Ahluwalia",
    rank: "Lt Col",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Lt Col Rachit Ahluwalia is known for his dynamic presence, passion for fitness and wicked sense of humor. A dedicated officer, he turns tough training sessions into engaging lessons, inspiring young Officers with both discipline and laughter. His second home is the gym, where he leads by example.",
    service: "Indian Army",
    birthday: "17 May",
    spouse_name: "Dr Rajani Walia",
    spouse_birthday: "03 Jul",
    anniversary: "01 Nov",
    order: 27,
  },
  {
    id: "pers-so-28",
    name: "Deepak Suryavanshi",
    rank: "Lt Cdr",
    designation: "Instructor",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Navy",
    order: 28,
  },

  // ── DoS / CoE / DIT ──
  {
    id: "pers-so-29",
    name: "Rahul Inamdar",
    rank: "Capt(IN)",
    designation: "Director of Studies",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A sincere officer with a positive outlook, he is an expert in EMI-EMC and firmly believes that every source and victim of interference can be mitigated through proper understanding and analysis. His dedication to precision and problem-solving defines his professional approach.",
    service: "Indian Navy",
    birthday: "03 Dec",
    spouse_name: "Mrs Priti",
    spouse_birthday: "19 Jul",
    anniversary: "26 Oct",
    order: 29,
  },
  {
    id: "pers-so-30",
    name: "OP Bohrey",
    rank: "Gp Capt",
    designation: "Controller of Examinations",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 30,
  },
  {
    id: "pers-so-31",
    name: "Gaurav K Upadhyay",
    rank: "Col",
    designation: "HoD DIT",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Colonel Gaurav Kumar Upadhyay joined MILIT in July 2024 as the Head of Department (IT & Studies). A tech enthusiast with a deep interest in abstract sciences, he brings a forward-thinking approach to his role.",
    service: "Indian Army",
    birthday: "10 Oct",
    spouse_name: "Mrs Shivani Upadhyay",
    spouse_birthday: "20 Jun",
    anniversary: "25 Jan",
    order: 31,
  },
  {
    id: "pers-so-32",
    name: "Munish Chadha",
    rank: "Capt(IN)",
    designation: "Instructor (IT)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "An alumni of 9th Naval Engineering Course, commissioned into the Electrical branch of Indian Navy on 01 Jan 1997. He is passionate about Cyber Security and was selected to undergo the prestigious Chevening Cyber Security Fellowship conducted at Cranfield University in United Kingdom.",
    service: "Indian Navy",
    birthday: "06 Oct",
    spouse_name: "Mrs Payal Chadha",
    spouse_birthday: "10 Feb",
    anniversary: "29 Nov",
    order: 32,
  },
  {
    id: "pers-so-33",
    name: "JS Rathore",
    rank: "Lt Col",
    designation: "Instructor (IT)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A soft-spoken yet highly dedicated Signaller, he is a blend of intellect and curiosity. An avid reader of historical and technical books, he finds equal thrill in unraveling the past and decoding complex technologies. A postgraduate from IIT Madras, he is an expert in IT and Cyber domains.",
    service: "Indian Army",
    birthday: "01 Dec",
    spouse_name: "Mrs Renu Rathore",
    spouse_birthday: "12 Oct",
    anniversary: "18 Feb",
    order: 33,
  },

  // ── Admin Branch ──
  {
    id: "pers-so-34",
    name: "Abhijeet Patil",
    rank: "Col",
    designation: "Col Admin",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 34,
  },
  {
    id: "pers-so-35",
    name: "Nitin V Buche",
    rank: "Col",
    designation: "Col Q",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 35,
  },
  {
    id: "pers-so-36",
    name: "Anand Pathak",
    rank: "Col",
    designation: "AA & QMG",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "A battle-hardened gunner officer, he skillfully juggles his roles as AA & QMG and Company Commander at MILIT. Since joining in July 2023, he has brought a wealth of experience from various staff and command assignments, proving that multitasking is indeed an art.",
    service: "Indian Army",
    birthday: "12 Apr",
    spouse_name: "Mrs Rupali",
    spouse_birthday: "01 Nov",
    anniversary: "19 Dec",
    order: 36,
  },
  {
    id: "pers-so-37",
    name: "Abhineet",
    rank: "Lt Col",
    designation: "QM",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "Lt Col Abhineet, from 4 Gorkhas, has been serving as the QM at MILIT since February 18, 2025. With the longest service within his regiment, he brings extensive experience and dedication to his role. Known for his appreciation of straightforward communication, he values clarity and directness in interactions.",
    service: "Indian Army",
    birthday: "04 Apr",
    spouse_name: "Mrs Pratibha",
    spouse_birthday: "14 Mar",
    anniversary: "26 Nov",
    order: 37,
  },
  {
    id: "pers-so-38",
    name: "Nikhil Khusape",
    rank: "Capt",
    designation: "Adjutant (Admin)",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Army",
    order: 38,
  },

  // ── Accounts / Finance ──
  {
    id: "pers-so-39",
    name: "Farhat Perveen",
    rank: "Sqn Ldr",
    designation: "Accounts",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    service: "Indian Air Force",
    order: 39,
  },
  {
    id: "pers-so-40",
    name: "KRS Shankla",
    rank: "Lt Col",
    designation: "Finance Officer",
    personnel_role: "staff_officer" as const,
    avatar_url: null,
    bio: "The flamboyant officer joined at the start of the course, instantly making his presence known — much like his signature stiff mustache, which perfectly mirrors his personality. His commanding presence in class and engaging delivery make every session worth attending.",
    service: "Indian Army",
    birthday: "20 Feb",
    spouse_name: "Mrs Reetika Shankla",
    spouse_birthday: "08 Feb",
    anniversary: "28 Oct",
    order: 40,
  },
  // ══════════════════════════════════════════════════════════════════════════
  // DSTSC-08 STUDENT OFFICERS — Real Nominal Rolls
  // ══════════════════════════════════════════════════════════════════════════

  // ── ARJAN DIVISION ──
  ...buildSOExt("Arjan", "arj", [
    { name: "Ananya Pandey", rank: "Wg Cdr", unit: "AE (L)", birthday: "12 Apr", spouse_birthday: "15 Jun", anniversary: "25 Nov" , bio: "The Air Force and Arjan Division Senior, Ananya is a cyber security expert with an algorithm permanently running behind that ever-present smile. Patience personified and sharp when it counts, he keeps the division\'s parade state on his fingertips and its morale on autopilot. Whether decoding network vulnerabilities or decoding the mood of forty-odd officers, his calm, composed leadership rarely misses a beat. The kind of senior who makes discipline feel like common sense."},
    { name: "Manmeet Singh Narang", rank: "Wg Cdr", unit: "F(P)", birthday: "13 Sep" , bio: "A fighter pilot and test pilot rolled into one, Manmeet brings an intellect that operates at altitude and a personality that refuses to fly straight. A rebel for the right reasons—lighter note intended—he questions everything with the precision of a man trained to push aircraft to their limits. Highly respected for his sharp mind and sharper observations, he remains, however, still in his lifelong quest for signed mess bills. The search, like most test flights, continues with no clear end in sight."},
    { name: "Chetan Raut", rank: "Wg Cdr", unit: "F(P)", birthday: "08 Nov", anniversary: "07 Dec" , bio: "A helicopter pilot who approaches life with the same smooth hover he brings to the cockpit—steady, unhurried, and remarkably unflustered. Chetan\'s ever-present smile suggests a man who has made peace with turbulence of every kind. When not flying or floating through the course with practised ease, he doubles as an unofficial financial consultant, dispensing advice on investments and savings with the confidence of a chartered accountant in uniform. Takes it easy, lands it perfectly."},
    { name: "SK Sharma", rank: "Wg Cdr", unit: "AE (M)", birthday: "03 Dec", spouse_name: "Mrs Nupur Chachra", spouse_birthday: "03 Dec", anniversary: "08 Feb" , bio: "A brilliant aeronautical engineer currently in chill mode—recharging before he returns to terrorise squadrons with his exacting maintenance standards. An undisputed expert on Su-30 aircraft systems, SK knows every nut, bolt and turbine blade by first name. At MILIT, he has chosen to deploy this fearsome expertise sparingly, preferring instead to enjoy Pune\'s weather and the rare luxury of unhurried weekends. His squadrons, blissfully unaware, are enjoying the calm before the storm."},
    { name: "Anshuman Rai", rank: "Lt Col", unit: "ASC", birthday: "29 Oct", spouse_birthday: "06 Mar", anniversary: "11 Dec", bio: "A kind-hearted Service Corps officer with a streak of subtle Azamgarh dabbangai, Anshuman blends patience with quiet authority. Known for calmly handling juniors, especially during the Army phase \\– he earns both respect and silent gratitude. A B.Tech (Biotechnology) and M.Sc (Food Technology), he combines academic depth with grounded soldiering. With Mrs Sangeeta and little Advit by his side, the Rai household reflects warmth, balance, and quiet strength." },
    { name: "Shardendu Pandey", rank: "Cdr", unit: "Logistics", birthday: "05 Feb", spouse_birthday: "18 Sep", anniversary: "13 Nov" , bio: "An intelligent electrical engineer from the Navy who moonlights—quite successfully—as the undisputed Meme King of MILIT. Shardendu\'s relatable memes, drawn from campus incidents with surgical timing, have achieved a circulation that most official circulars can only dream of. Beyond the laughs, he is the officer with quick practical solutions to classroom problems, cutting through complexity with the same efficiency he brings to his punchlines. Excellent sense of humour, sharper sense of timing."},
    { name: "Chinthu K V", rank: "Wg Cdr", unit: "AE (L)", birthday: "09 Sep", spouse_name: "Sqn Ldr Kanishka Sharma", spouse_birthday: "26 May", anniversary: "11 Nov", bio: "A communication engineer juggling courts, committees, and conversations, Krishnan is a seamless organiser — Squash Championship organiser and Ghorpad editor, delivering deadlines with quiet persistence. Known for getting things done with well-placed prompts, digital and otherwise, and for his curiosity with AI tools, he pairs efficiency with intent. Proud of his razor-sharp moustache, he brings both style and substance. He now heads to Kurseong for a well-deserved co-location posting, finally closing the distance between duty and home. Moustache sharp, signals sharper — always connected, always in control." },
    { name: "Phani Sushant", rank: "Cdr", unit: "Executive Branch", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" , bio: "A happy-go-lucky officer with technical understanding and maturity well beyond what his cheerful demeanour might suggest. Phani cruises through academics with quiet competence, absorbing complex subjects with the ease of a man who genuinely enjoys learning. But when the books close and the evening begins, he unleashes a side that is pure, unfiltered fun—dance floors and casino tables know him well. The rare officer who balances technical depth with unapologetic enjoyment of life."},
    { name: "Rishabh Rawat", rank: "Lt Col", unit: "Infantry", birthday: "22 Sep", spouse_birthday: "11 Mar", anniversary: "30 Nov", bio: "Hailing from Uttarakhand, Rishabh carries the quiet toughness of the mountains with effortless ease. A Special Forces officer, his medium frame hides Arjan Division\'s unofficial \'jolly generator.\' Living by \'worked hard, now party harder,\' he blends sharp operational insight with effortless camaraderie. With Mrs Monika alongside and little Vivaan stealing the spotlight, his morale is always high." },
    { name: "Shivam Trivedi", rank: "Wg Cdr", unit: "Logistics", birthday: "19 May", spouse_birthday: "04 Feb", anniversary: "15 Mar" , bio: "The officer with the purple eye and a gift for convincing people through the fine art of strategic confusion. A logistician by appointment and an engineer by degree, Shivam\'s true specialisation lies in Dale Carnegie\'s techniques of influencing others—applied liberally and effectively across the course. Whether negotiating deadlines, persuading committees, or simply winning an argument no one realised they were having, he operates with a charm that leaves people agreeing before they fully understand what they agreed to."},
    { name: "Sreejesh N", rank: "Cdr", unit: "Engineering", birthday: "10 Jul", spouse_name: "Mrs Shruti Nair", anniversary: "09 Jun", bio: "Sreejesh, a calm and composed naval ship designer from Kerala, is the MILIT X country champion. He spent the course diligently attempting to relate every subject back to ship design \\– sometimes logically, sometimes creatively. Quiet, thoughtful and ever polite, he also developed a parallel domain expertise widely appreciated in Arjan Division: the fine art of securing an outpass. Married to Shruti, he was blessed with a beautiful and adorable baby girl, Sanvika." },
    { name: "Gopikrishnan U", rank: "Cdr", unit: "Engineering", birthday: "29 Mar", spouse_name: "Mrs Swati Ramesh", spouse_birthday: "22 Mar", anniversary: "02 Sep" , bio: "Do not be deceived by the quiet exterior—this naval officer is anything but silent. Beneath the composed surface lies a talented sportsman, a passionate cricketer, and a runner who takes his fitness as seriously as his profession. Technically sharp with deep domain expertise, Gopikrishnan is also a procurement master who navigates acquisition complexities with the confidence of someone who has read the fine print twice. Full of talent, short on unnecessary words."},
    { name: "Pravin Kumar Vinod Rai", rank: "Wg Cdr", unit: "F(N)", birthday: "15 Sep", spouse_name: "Mrs N Sneha", spouse_birthday: "07 Feb", anniversary: "11 Oct" , bio: "The officer version of \"BC types\"—deployed with affection and maximum effect. Pravin carries the most easy-going personality in Arjan Division and an arsenal of humour that can make anyone blurt into laughter with a single well-timed remark. An Electronic Warfare master by profession, he jams enemy radars and friendly composure with equal proficiency. His quick bits during lectures, breaks, and gatherings have achieved legendary status. If morale were a weapon system, Pravin would be its chief operator."},
    { name: "Ashay Pal", rank: "Lt Col", unit: "Army Air Defence", birthday: "23 Jun", spouse_birthday: "16 Jul", anniversary: "16 Apr", bio: "An intelligent AAD officer with the rare ability to reach lectures \'just-in-time\' \\– precision timing, Air Defence style. Often spotted tracking stocks with more focus than the lecture itself, and arriving in a swanky BMW that matches his market ambitions. Known to sleep during central lectures, but strictly when the markets are closed. Calm, calculated, and always trading something \\– time, stocks, or attention. With Mrs Vineeta Shahi and little Advik and Aarik completing the portfolio." },
    { name: "Dhar Anurag S", rank: "Major", unit: "Corps of Signals", birthday: "04 Dec", spouse_birthday: "25 Jul", anniversary: "12 Oct", bio: "Anurag is widely regarded as Arjan Division\'s resident electronics wizard and enthusiastic tech evangelist. Known to code with ChatGPT and design slide banners, he has a habit of asking probing questions during guest lectures that even the speaker pauses to reconsider the topic. Anurag firmly believes technology can solve almost everything \\-- given enough Wi-Fi." },
    { name: "Anuj Kumar", rank: "Major", unit: "Infantry", birthday: "30 May", spouse_birthday: "12 Nov", anniversary: "06 Dec", bio: "From the hills of Uttarakhand comes Anuj, blending modern sophistication with unmistakable pahadi charm. A keen sportsman and excellent runner, he carries himself with calm confidence and natural ease. Whether on the sports field or among friends, Anuj demonstrates that steady composure and quiet consistency often speak louder than any grand display." },
    { name: "Awanendra Pratap Singh", rank: "Major", unit: "Corps of Engineers", birthday: "26 May", spouse_birthday: "28 Dec", anniversary: "12 Dec", bio: "A UES entry officer who seemed to have course mates in every batch \\– networking level: a true \'strategic dominance.\' An Engineers officer, academic to the hilt, and armed with a cup of deadly black coffee. A true gentleman in speech and bearing, yet never misses a chance to fire a question at every instructor. With Mrs Ritupriya, an educator by profession, and little Raghav already in early training, the team is complete." },
    { name: "Sumit Singh Sidhu", rank: "Sqn Ldr", unit: "AE (M)", birthday: "28 Oct", spouse_birthday: "05 May", anniversary: "17 Apr" , bio: "A humble, sincere officer with inherent leadership qualities that surface without effort or announcement. Soft-spoken and deeply knowledgeable on Su-30 systems, Sumit also serves as sponsor officer to international course mates, a role he fills with genuine warmth and patience. A person who loves to roam—whether across cities or ideas—he is also a talented writer with a quiet love for poetry. The kind of officer who leads best when he thinks no one is watching."},
    { name: "Amit Kumar", rank: "Major", unit: "Army Ordnance Corps", birthday: "31 Mar", spouse_birthday: "17 May", anniversary: "02 Mar" , bio: "An excellent officer from a family where sport is not a hobby but a way of life. Amit is an exceptional basketball player whose court presence is matched only by his ever-present smile and helpful nature. Sincere, dependable, and always willing to step forward, he treats every task—academic or athletic—with the same quiet commitment. In a division full of strong personalities, his warmth and sportsmanship make him the teammate everyone wants."},
    { name: "Nitish Sharma", rank: "Sqn Ldr", unit: "Administration", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" , bio: "A TACDE Directing Staff from the Air Force with a deep and genuine understanding of combat tactics that commands respect across services. Nitish possesses, however, one remarkable talent that has achieved near-mythical status: the ability to sleep through an entire class, wake up precisely to ask a pointed question, and doze off again before the speaker finishes answering. Whether this represents extreme confidence in his existing knowledge or an advanced power-saving mode remains a matter of scholarly debate."},
    { name: "Praneeth H Vishnu", rank: "Major", unit: "Army Air Defence", birthday: "04 Feb", spouse_birthday: "24 Jan", anniversary: "08 Jul", bio: "A calm and composed AAD officer from Kerala, Praneeth is the definition of a \'silent professional.\' Rarely seen without purpose, and once the work is done he vanishes just as quietly. Speaks less, observes more, and lets actions do the briefing. His understated presence carries both efficiency and mystery in equal measure." },
    { name: "Harpreet Singh", rank: "Major", unit: "Infantry", birthday: "21 Jun", spouse_birthday: "28 Aug", anniversary: "25 Mar", bio: "Harpreet, a proud Dogra officer and pillar of Arjan Division\'s Laugh Out Loud Gang, spreads cheer so infectious one suspects a secret happiness supply. A long-serving Adjutant of both unit and Regimental Centre, discipline runs deep. A fun-loving soul who stretches two pegs across four over six hours, he balances work, academics, and family beautifully. Devoted husband to Babneet and proud father to the charmingly bossy Miraya." },
    { name: "Ravi Prakash Singh", rank: "Major", unit: "Mechanised Infantry", birthday: "03 Jan", spouse_birthday: "14 Aug", anniversary: "19 Feb" , bio: "RP from Sikar, Rajasthan \\– Arjan Division\'s very own \'Mr Know-All\', has fought a heroic battle with technology and technical jargon, eventually emerging with an MSc in Military Technology despite once being proudly non-techy. Always trying to jump out of the box, a geopolitics enthusiast and unstoppable news addict, he consumes news with every meal. Devoted to wife Ankita and son Viyansh, though the news channels might claim equal attention."},
    { name: "Vinay Prakash", rank: "Major", unit: "Infantry", birthday: "18 Nov", spouse_birthday: "11 Aug", anniversary: "18 Apr", bio: "Walks fast enough to make everyone else look static. Once ruled the tennis court \\– not by skill alone, but by owning both racquets. A proud Punjab Regiment Officer and a non-techy ex-NDA who casually ended up coding, confusing both himself and the instructors. Newly married to Anjali, now setting up home in Pune \\– one delayed purchase at a time. Efficient in movement, experimental in life decisions." },
    { name: "Amit Gill", rank: "Major", unit: "Infantry", birthday: "31 Mar", spouse_birthday: "17 May", anniversary: "02 Mar", bio: "A slow-moving infantryman with a remarkable ability to store both worldly knowledge and, seemingly, everything else. Always seen with a book in hand, Amit alternates effortlessly between deep reading and deeper sleep \\– his true forte. Unfazed even by Air Faculty aircraft overhead, his calm borders on tactical hibernation. With Mrs Pooja and little Amber, the Gill household thrives on quiet wisdom." },
    { name: "Deepak Yadav", rank: "Major", unit: "Mechanised Infantry", birthday: "07 May", spouse_birthday: "14 Aug", anniversary: "22 Nov", bio: "Deepak is Arjan Division\'s resident jovial spirit, proudly maintaining a \'zero figure\' that proves happiness may indeed be the best fitness regime. A Mechanised Forces officer capable of mingling with anyone from any service, he balances humour with sharp staff-officer instincts. Father to artistic Shanaya, he also welcomed a baby boy during the course \\– clear evidence of meticulous staff planning." },
    { name: "Harshdeep Singh", rank: "Major", unit: "Regiment of Artillery", birthday: "27 Nov", spouse_birthday: "15 Mar", anniversary: "04 Sep", bio: "Harshdeep, Arjan Division\'s MG Arty from the Gunners, is one of those quietly brilliant minds armed with a razor-sharp technical instinct. A man of few words, he speaks sparingly \\– but when he does, the room listens with full attention. Calm, precise and quietly confident, he also achieved peak efficiency during the course by welcoming twins into the family." },
    { name: "Rohit Seth", rank: "Major", unit: "Infantry", birthday: "12 Apr", spouse_birthday: "30 Jan", anniversary: "08 Dec", bio: "From Rajasthan with Punjabi flair, Rohit is as famous for his commanding moustache as for his roaring Bullet. Usually found with a hand on his moustache like a regimental insignia, he blends effortless swag with a dependable, large-hearted personality. A natural host with his signature \'clap box\' energy, he balances sharp discipline with equally passionate downtime. With Mrs Anindita adding grace, together they radiate warmth and positive vibes." },
    { name: "Comdt (JG) Pankaj Ghungtyal", rank: "Comdt (JG)", unit: "Indian Coast Guard", birthday: "05 Nov" , bio: "An excellent mechanical engineer from the Indian Coast Guard who thrives on turbines, torque, and all things that rotate. When subjects drift too deep into electronics, however, a visible frustration surfaces—as if circuit boards were a personal affront to the laws of mechanics. Highly disciplined and a no-nonsense professional, Pankaj approaches every task with the directness and rigour that define the Coast Guard ethos. He represents the service with quiet pride and zero tolerance for shortcuts."},
    { name: "Haobam Rahul Singh", rank: "Major", unit: "Infantry", birthday: "15 Aug", spouse_birthday: "20 May", anniversary: "10 Mar", bio: "A proud Manipuri officer with an excellent infantry career record, Rahul carries himself with quiet confidence and a constant smile. Known for his calm nature and sporting interests in golf, tennis and squash, he balances professional dedication with being deeply family-oriented. For Rahul, duty and family travel side by side \\– handled with the same steady commitment." },
    { name: "Bhupesh Yadav", rank: "Major", unit: "Corps of Signals", birthday: "23 Oct", spouse_birthday: "11 Jun", anniversary: "15 Nov", bio: "Bhupesh from Haryana is fondly known as Arjan Division\'s very own \'Gentle Giant.\' His towering presence may appear intimidating at first, but his easy humour and cheerful personality quickly change that impression. Frequently lifting the mood with a timely remark, Bhupesh proves that strength and simplicity together make every team stronger and every gathering livelier." },
    { name: "Ajatshtru Rampal", rank: "Major", unit: "Infantry", birthday: "23 Mar", spouse_birthday: "09 Jan", anniversary: "07 Oct", bio: "A true OG Gorkha officer \\– sharp as his khukri and just as dependable. Equally at ease solving tactical puzzles and handling technical complexities, he is the man every team wants. Known for his razor-sharp mind, unexpectedly elegant handwriting, and the ability to cook like a pro \\– precision clearly extends beyond the battlefield. A devoted father to Dhairya and a dependable friend." },
    { name: "Pillai Mithun", rank: "Major", unit: "Regiment of Artillery", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct", bio: "Pillai, a Gunner who somehow defies every Gunner stereotype, became so familiar that even instructors simply called him Pillai. A true X-NDA man with a free-spirited and pressure-proof personality, he glides through Arjan Division without ever appearing stressed. Blessed with a baby during the course, and married to a doctor who likely keeps the family medically mission-ready, Pillai remains deeply family-oriented." },
    { name: "Pushpendra Singh", rank: "Major", unit: "Armoured Corps", birthday: "06 Jun", spouse_birthday: "18 Feb", anniversary: "19 Nov", bio: "Pushpendra stands as the unshakeable foundation stone of Arjan Division\'s LOL Gang \\– flamboyant, stylish and unmistakably present. A Mud Corps officer who carries swagger like a uniform, he can exchange polished conversation with Generals at formal dinners before effortlessly owning the dance floor at course parties. A devoted Rajput husband to Varuna and doting father to little Hunar." },
    { name: "Alok Negi", rank: "Major", unit: "Infantry", birthday: "06 Feb", spouse_birthday: "07 Aug", anniversary: "15 Oct", bio: "Alok, the Highlander from Dehradun and a proud 1st Para Special Forces officer, is Arjan Division\'s resident fitness powerhouse. A devoted follower of the \'in-time\' philosophy and unofficial sponsor of Muscle Blaze, he tackles everything with relentless energy. Often seen learning with eyes closed like a disciple of Master Shifu, Alok is fondly known as the Chota Hulk." },
    { name: "Ishank Sharma", rank: "Major", unit: "Regiment of Artillery", birthday: "28 Jun", spouse_birthday: "19 Apr", anniversary: "12 Nov", bio: "Ishank is Arjan Division\'s dedicated fitness enthusiast who treats every workout like a mission objective. Despite his impressive physical energy, he remains soft-spoken and composed. Always willing to step forward when required, he played an enthusiastic role as NSA organiser, ensuring several activities ran smoothly. Ishank quietly proves that reliability is often the strongest form of leadership." },
    { name: "Shashi Kumar", rank: "Major", unit: "Regiment of Artillery", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct", bio: "Shashi is Arjan Division\'s very own \'silent killer\' \\– calm, composed and rarely seen flustered. An IBM-certified professional with a fondness for literature, he somehow manages to stay ahead of time in most tasks. Particularly swift when sending claims for settlement, his efficiency has sparked rumours that he might secretly hold shares there." },
    { name: "Arpit Kumar Upadhyay", rank: "Major", unit: "Mechanised Infantry", birthday: "19 Mar", spouse_birthday: "25 Oct", anniversary: "04 Jul" , bio: "A Mechanised Guards officer and among the junior-most of the course, often found in the front row—fighting sleep with dignity and limited success. Adjutant of Arjan Division, loved and respected by all, and known for cultivating unusually serious thoughts about life amidst the chaos. Fortunate to live by the foothills of Sinhagad, enjoying a Mahabaleshwar-like view daily. With Anukriti, a German language trainer also pursuing cosmetology with high ambitions—and his favourite company—the two prefer each other over everything else. Guards by badge, junior-most by roster—best deployed in couple comfort zone."},
    { name: "Mukul", rank: "Major", unit: "Corps of Engineers", birthday: "11 Jan", spouse_birthday: "19 Feb", anniversary: "21 Apr", bio: "An Engineers officer and instructor by heart, Mukul is soft-spoken \\-- low on volume but high on clarity. A Surveykshak expert who can map terrain by day and the party scene by night, he balances precision with pure vibe. Known for speaking well without ever raising his voice, he lets substance do the talking. With Dr Ruchika by his side, the couple is often found enjoying life \\-- preferably with good music and better company." },
    { name: "Shakti Kumar Upadhyay", rank: "Major", unit: "Infantry", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct", bio: "An avid runner and smooth communicator, unshaken when things get real. Battle-tested across high-altitude, CI grids, and deserts, and an ex-OTA instructor, Shakti is known for firm leadership and perfectly timed reality checks. Strong believer that clarity separates leaders from passengers. Professionally aligned with AI/ML, but truly committed to concerts, clubbing, and comedy. With Mrs Kesarika \\– designer, sportsperson, cook, and laughter hub." },
    { name: "Alebachew Etana Kusa", rank: "Lt Col", unit: "Ethiopian Army", birthday: "28 Dec", spouse_birthday: "10 Nov", anniversary: "19 Jul" , bio: "A senior officer from the Ethiopian Army, Lt Col Alebachew brings a wealth of operational experience and a quiet, dignified presence to the course. His cross-cultural perspective enriches discussions and his professional demeanour reflects the strong military traditions of the Ethiopian Defence Forces. A composed and observant officer who absorbs more than he reveals."},
    { name: "Kashun Bahiru Wolderufael", rank: "Major", unit: "Ethiopian Air Force", birthday: "07 Apr", spouse_birthday: "01 Aug", anniversary: "29 Apr" , bio: "A logistician from the Ethiopian Air Force with an unwavering loyalty to whichever football team happens to be winning at the time—tactical flexibility at its finest. Kashun is as far from home as he is from the English language, but what he lacks in vocabulary he makes up for in warmth, effort, and a smile that needs no translation. His determination to communicate, learn, and celebrate every goal—regardless of whose team scored—has made him one of Arjan Division\'s most endearing characters."},
    { name: "GKDBJ Dissanayake", rank: "Sqn Ldr", unit: "Sri Lanka Air Force", birthday: "11 Jun", spouse_birthday: "14 Sep", anniversary: "08 Feb" , bio: "An ever-smiling Sri Lankan officer who has been to practically every country in Asia and is currently on his third visit to India—a testament to both his wanderlust and his appreciation for Indian hospitality. Smart, sincere, and unfailingly cheerful, Dissanayake brings an international warmth that transcends borders and brightens every room he enters. His travel stories alone could fill a semester."},
    { name: "WGPCI Wijisekara", rank: "Sqn Ldr", unit: "Sri Lanka Air Force", birthday: "06 Aug", spouse_birthday: "13 Sep", anniversary: "22 Oct" , bio: "The mysterious Sri Lankan officer of Arjan Division, always seen taking elaborate precautions against deteriorating weather—as if Pune\'s mild climate were a personal threat. His inner intelligence is kept carefully guarded, revealed only in flashes during technical discussions before being safely locked away again. Quiet, watchful, and perpetually prepared for rain, Wijisekara remains the division\'s most intriguing enigma."},
  ]),

  // ── CARIAPPA DIVISION ──
  ...buildSOExt("Cariappa", "car", [
    { name: "Raviraj SR", rank: "Wg Cdr", unit: "AE (L)", birthday: "24 Aug", spouse_name: "Dr Jyotika Rao", spouse_birthday: "01 Mar", anniversary: "16 May", bio: "Wg Cdr Raviraj S R, commissioned in the AE (L) Branch of the Indian Air Force in 2011, is an accomplished technocrat with an M.Tech in Aerospace Engineering from IIT Madras. Trained on advanced missile systems with a proven record of professional achievement in SAM systems. An avid sportsman, he is a keen Badminton and Golf player and the proud winner of the 2025-26 MILIT Badminton Singles and Doubles Championships. His wife, Dr Jyotika, is a dentist by profession and a French language enthusiast. They are blessed with a 5 year old son, Aprameya." },
    { name: "Manoj Kumar Gulia", rank: "Cdr", unit: "Logistics", birthday: "14 Sep", spouse_name: "Mrs Ritu", spouse_birthday: "09 Nov", anniversary: "18 Apr", bio: "A passionate cycling enthusiast and an accomplished swimmer, Cdr Manoj brought quiet determination and discipline to the course. Fondly known as the \'Real-Estate King\' of the course and perhaps even of Pune, he was always well informed about property trends and opportunities. Though often silent in class, his sharp understanding of radar and electronics spoke volumes. Calm, composed, and technically proficient, he combined understated confidence with professional expertise." },
    { name: "L Praveen Kumar", rank: "Wg Cdr", unit: "AE (L)", birthday: "13 Jun", spouse_name: "Mrs Gitanjali S", spouse_birthday: "14 Mar", anniversary: "06 Jun", bio: "Wg Cdr L Praveen Kumar is a highly motivated and diligent officer. He is the recipient of the President\'s Plaque for standing first in the Order of Merit at both the Air Force Academy and the Air Force Training College. He has served as an Engineering Officer in Su-30 MKI squadrons and at the prestigious Tactics and Air Combat Establishment (TACDE). An avid runner, he also enjoys playing lawn tennis and badminton. He is married to Sqn Ldr Gitanjali S and is blessed with two daughters." },
    { name: "Vivek V Solat", rank: "Cdr", unit: "Engineering", birthday: "04 Aug", spouse_name: "Mrs Sonal", spouse_birthday: "20 Oct", anniversary: "06 Sep", bio: "Hailing from Ahmednagar, this Aviation Engineer is a proud alumnus of Sainik School Satara with a strong Naval Aviation background. An avid reader and keen explorer of local sights, he enjoys discovering new places wherever he goes. During the course, he embraced fatherhood \\– welcoming the first child of DSTSC-08 at the Military Institute of Technology, marking a joyful milestone in his life." },
    { name: "Krishnendu Sanyal", rank: "Cdr", unit: "Education Branch", birthday: "13 Jan", spouse_name: "Mrs Shreya Chakraborty", spouse_birthday: "01 Nov", anniversary: "23 Jan", bio: "An Indian Navy officer specialising in Thermal Sciences and Fluid Mechanics, he holds an MTech in Thermal Engineering. During his MILIT tenure, he was famously the last to arrive each morning \\– his entry often confirming full attendance \\– while somehow never being caught off guard. Calm and unflappable, with a fondness for movies and travel, he is also remembered for his legendary party spirit and for seamlessly coordinating the much-enjoyed Goa visit." },
    { name: "Kartik Gulati", rank: "Lt Col", unit: "Mechanised Infantry", birthday: "19 Aug", spouse_name: "Mrs Sneha Dey", spouse_birthday: "21 Jul", anniversary: "02 Jul", bio: "As a Mechanized Infantry Officer, his life is defined by the high tempo synergy of man and machine; a world of tactical precision and heavy armour. While his professional life is built on the discipline of leading The Iron Fist, he finds his necessary balance in the stillness of nature. Whether fishing in quiet waters or tending to his garden, these moments of patience provide a vital contrast. Anchored by his family, his wife Sneha Dey and daughter Hritvika Gulati are the heart of his world." },
    { name: "Chandreshwar Manjhi", rank: "Cdr", unit: "Logistics", birthday: "05 Aug", spouse_name: "Dr. Swati", spouse_birthday: "13 Mar", anniversary: "15 Oct", bio: "Calm by default and reserved by habit, the officer is known for his punctuality and meticulously planned approach to every task. Usually quiet and observant, he prefers letting his actions speak for themselves. However, he occasionally surprises everyone with his lively presence at social gatherings. Polite, considerate, and quietly helpful, he reflects a fine balance between professionalism and personality, earning respect through reliability, humility, and thoughtful conduct." },
    { name: "Kushal Sharma", rank: "Wg Cdr", unit: "AE (L)", birthday: "30 Jan", spouse_name: "Sqn Ldr Kinnari Jain", spouse_birthday: "22 Jul", anniversary: "19 Oct", bio: "Rooted in the vibrant spirit of Punjab, this engineer spends his days decoding the complexities of fighter jets and his evenings conquering squash courts, dance floors, and lively gatherings. A sharp and technically adept officer, he is rarely seen without a squash racket in hand or riding his Royal Enfield with unmistakable enthusiasm. Living by the motto \'work hard, party harder,\' he brings together discipline, energy, and camaraderie." },
    { name: "Anurag Pattanayak", rank: "Cdr", unit: "Logistics", birthday: "08 Jun", spouse_name: "Mrs Poorvi Singh", spouse_birthday: "19 Dec", anniversary: "30 Nov", bio: "Popularly known as Pattu (or Pats when the party starts), he is a man of layers. To his colleagues, he is the picture of composure. To his friends, he is the guy who hears the word \'celebration\' and is already halfway out the door. His favourite way to recharge is hitting the open road with his two favorite ladies, his wife and daughter who serve as the anchors to his drifting soul and the navigators of his journey." },
    { name: "Arjun Singh", rank: "Lt Col", unit: "Infantry", birthday: "17 Aug", spouse_name: "Mrs Deepthi Chauhan", spouse_birthday: "05 Aug", anniversary: "25 Jun", bio: "The formidable \'Army Senior\' of Cariappa Division, he was well known for keeping juniors on their toes. An Infantry officer from 4 MAHAR (BORDERS) Regiment, he is a graduate of the GRS Department, Arts Faculty, Delhi University. Happily married since 2018, his wife holds an M.Tech in Computer Science from Anna University, Tamil Nadu. The couple is blessed with a son, Advait, and a daughter, Danika, who bring joy and balance to his life beyond uniform." },
    { name: "Akhil BG", rank: "Wg Cdr", unit: "F(P)", birthday: "27 Aug", spouse_name: "Sqn Ldr Swati Vasudev(Retd)", spouse_birthday: "11 Apr", anniversary: "10 Mar", bio: "A tall and lanky helicopter pilot, he is known for his calm and composed demeanour, especially in demanding situations. His quiet confidence and steady temperament reflect the qualities essential for aviation. Despite limited practice, he successfully led the Division\'s basketball team to a podium finish, using his height, agility, and leadership on the court. Balancing professional skill with sporting spirit, he proved to be a dependable presence both in the air and on the field." },
    { name: "Devidas Amale", rank: "Lt Col", unit: "Intelligence Corps", birthday: "11 Dec", spouse_name: "Mrs Shraddha", spouse_birthday: "13 Nov", anniversary: "13 Aug", bio: "A proud local from Pune and a keen kitchen-garden enthusiast, he is known for his thoughtful demeanour and sharp intellect. With a subtle calm always visible on his face and intense thoughts working beneath the surface, he approaches challenges with quiet confidence. During the course, he often served as a pathfinder for his peers, guiding them through unfamiliar routes and situations with ease. Reliable and perceptive, he combined local knowledge with a composed personality." },
    { name: "Rinson Robinson", rank: "Comdt (JG)", unit: "Indian Coast Guard", birthday: "08 Dec", spouse_name: "Mrs Adelene Jenefer", spouse_birthday: "04 Nov", anniversary: "28 Dec", bio: "The hardened marine engineer with salt in his veins, well versed in propulsion and hull integrity. When not decoding cryptic circuit diagrams or cursing antenna theory, he grabs his GoPro for epic bike rides, turning adrenaline into footage. As his name echoes the rhythm of strings, his hobby of strumming the guitar and belting out sea shanties brings melody to house parties." },
    { name: "Praveen Mishra", rank: "Major", unit: "Regiment of Artillery", birthday: "28 May", spouse_name: "Mrs Rashmi Mishra", spouse_birthday: "05 Sep", anniversary: "07 Dec", bio: "A tall and lean Rimcollian, forever glued to books that lay far beyond the prescribed syllabus. A proficient Gunner officer, he was known for his calm, composed demeanor under all circumstances. Deep discussions on often alien topics were his forte, leaving listeners intrigued and enlightened in equal measure. An easy-going soul, he remained largely unperturbed by the chaos of life. A meticulous planner and exceptionally well-organised. When not immersed in thought, he could be found on the tracks or effortlessly acing a round of golf." },
    { name: "Navin Kumar", rank: "Major", unit: "Infantry", birthday: "13 Sep", spouse_name: "Dr Shefali Chauhan", spouse_birthday: "02 Nov", anniversary: "28 Jun", bio: "A native of Gorakhpur, this Infantry officer of 8 GR blends field grit with vibrant energy. An adventure seeker with a creative streak, he enjoys tennis, football, and watercolour painting. Often seen at the court, gym, or social gatherings, he is known for his smile and humour. With his wife, a Medical Officer, he shares his home with two Himalayan Shepherds, balancing service life with warmth and optimism." },
    { name: "Jaidev Singh", rank: "Major", unit: "Infantry", birthday: "09 Jan", spouse_name: "Lt Cdr Priti Shekhawat", spouse_birthday: "28 Apr", anniversary: "07 Dec", bio: "An Infantry officer who wears his heritage as proudly as his uniform. With over 12 years of distinguished service, he combines operational sharpness with a forward-looking edge through his niche expertise in Python coding and programming \\– bridging boots-on-ground soldiering with modern technological fluency. A proud torchbearer of the \'Rajasthani Rajput Banna\' spirit, he embodies courage, camaraderie, and cultural pride. Charismatic yet grounded, he brings intellect, energy, and an ever-welcoming smile to the Division." },
    { name: "Shwetank Gaur", rank: "Major", unit: "Regiment of Artillery", birthday: "26 Feb", spouse_name: "Mrs Shivani Trivedi", spouse_birthday: "02 Jan", anniversary: "09 Mar", bio: "Maj Shwetank Gaur was commissioned into the 12 Medium Regiment in June 2013, where he gained valuable operational experience in the field. He was later posted to the 122 SATA Regiment, developing strong expertise in Intelligence, Surveillance, and Reconnaissance (ISR) during active operations. He has also served as an Instructor (Class B) at the Indian Military Academy, where he inspired and mentored cadets through his professional acumen, leadership, and commitment to excellence." },
    { name: "Anshul Rana", rank: "Major", unit: "Corps of Engineers", birthday: "09 Nov", spouse_name: "Mrs Devyani Singh", spouse_birthday: "29 Sep", anniversary: "09 Feb", bio: "A Sapper to the core, he embodies the grit, precision, and resilience that define the Corps of Engineers. A passionate golfer and an enthusiastic bike rider, he enjoys the balance of discipline and leisure that these pursuits offer. Known for his refined taste in celebrations and meaningful conversations, he brings warmth and camaraderie to every gathering. With a lively yet grounded personality, he values both professional excellence and the simple joys of good company." },
    { name: "Ahmed Faraz Ansari", rank: "Sqn Ldr", unit: "F(P)", birthday: "09 Jun", spouse_name: "Mrs Syeda Asma Husaini", spouse_birthday: "23 Dec", anniversary: "26 Jul", bio: "A fighter pilot and Qualified Flying Instructor, he brings precision, discipline, and confidence to both the cockpit and everyday life. Beyond flying, he was often found conducting \'clandestine ground operations\' on BGMI, showcasing his competitive spirit even in the virtual battlefield. A dedicated workout enthusiast, he believes strongly in maintaining peak physical fitness. Off duty, he enjoys experimenting in the kitchen, combining his love for cooking with his passion for food." },
    { name: "Lokesh Mehlan", rank: "Sqn Ldr", unit: "AE (M)", birthday: "30 Jan", spouse_name: "Sqn Ldr Swati", spouse_birthday: "20 May", anniversary: "27 Nov", bio: "Sqn Ldr Lokesh Mehlan is an AE(M) Officer and a Flight Engineer; among other things, he is an IITian too. A proud JAT who treats the gym as his second squadron, he can lift aircraft manuals and dumbbells with the same discipline. He is married to Sqn Ldr Swati, and they are blessed with two little co-pilots at home, daughter Devika and son Dev Pratap." },
    { name: "Mandeep Kumar", rank: "Major", unit: "The Guards", birthday: "18 Jun", spouse_name: "Mrs Nisha Sharma", spouse_birthday: "12 Dec", anniversary: "25 Nov", bio: "A native of Rohtak, this well-built Guards officer balances a demanding course, family life, and Pune with steady determination. Fond of music and basketball, he believes in consistency and quiet effort. Evenings often find him unwinding with his closest friend, Maj Rakesh, whose effortless camaraderie needs no context. Supported by his wife Nisha and ruled by his little \'boss\' at home, he remains dependable, witty, and grounded." },
    { name: "Shiv Kumar Sharma, SM", rank: "Major", unit: "Infantry", birthday: "13 Feb", spouse_name: "Mrs Swati Sharma", spouse_birthday: "21 Sep", anniversary: "02 Aug", bio: "Dynamic Special Forces Officer Maj Shiv Kumar Sharma is sober, hardworking, down-to-earth, universally admired by course mates, juniors, and seniors alike. Avid reader and runner who traded battlefield boots for court conquests: Squash Runner-Up, instrumental in Cariappa Div\'s epic Basketball Finals charge to runners up position. Happily married to Swati who is a Team Lead in TCS and a Software Engineer. Both are parents to whirlwind 5-year-old Iyra." },
    { name: "Ajay Partap", rank: "Major", unit: "Army Air Defence", birthday: "15 Jan", spouse_name: "Mrs Nikki Rana", spouse_birthday: "08 Nov", anniversary: "27 Feb", bio: "Maj Ajay, an Air Defence specialist, is as dynamic in personality as he is in profession. Fond of golf, music, and content creation, he brings energy and creativity to every setting. Known for his trademark desi slang and warm camaraderie, he truly lives up to the phrase \'yaaron ka yaar.\' His open-armed hugs and effortless charm often draw comparisons. Ever approachable and full of positive vibes, he strengthens bonds wherever he goes. Happily married, he is a proud father to a son." },
    { name: "Ajit Singh", rank: "Major", unit: "Infantry", birthday: "22 Nov", spouse_name: "Mrs Ishali Raina", spouse_birthday: "07 Aug", anniversary: "19 Apr", bio: "An Infantry officer from Karnataka, Ajit has a keen interest in astronomy and space science. Known for his curious mind, he often spent his time gazing at the daytime sky from class, jokingly hoping to spot a few stars. Occasionally found catching up on sleep, he maintained a calm and composed demeanour throughout. Thoughtful and observant, he is an officer with a sharp eye for detail and a quiet sense of humour." },
    { name: "Amit Kumar Singh", rank: "Major", unit: "Infantry", birthday: "03 Oct", spouse_name: "Mrs Niharika Singh", spouse_birthday: "26 Feb", anniversary: "06 Feb", bio: "Maj Amit is an Infantry officer known for his thoughtful nature and simple outlook on life. His personal motto could well be summed up as \'debating over life and playing badminton,\' reflecting both his reflective mindset and love for sport. Often engaging in meaningful conversations, he enjoys exchanging ideas as much as he enjoys time on the badminton court. A simple family man at heart, he values peace, balance, and the quiet joys of life." },
    { name: "Gurtej Singh Gill", rank: "Major", unit: "Infantry", birthday: "03 Mar", spouse_name: "Maj Simran Kaur", spouse_birthday: "02 Aug", anniversary: "03 Jul", bio: "Maj Gurtej is a jovial and socially adaptable officer with a keen penchant for reading and continuous learning. Happily married and blessed with two adorable children, he shares a strong bond with his wife, a serving officer presently posted in MH Mhow. Known for embracing challenges head-on, he constantly strives to test his limits. His positive outlook and easy-going nature make him a pleasant companion and a dependable colleague." },
    { name: "Vijay Singh Tomar", rank: "Major", unit: "Corps of Signals", birthday: "15 Jan", spouse_name: "Mrs Shweta Sirohi", spouse_birthday: "29 Dec", anniversary: "25 Feb", bio: "Maj Vijay Singh Tomar is a graduate in IT and Telecommunications from Military College of Telecommunication Engineering. Born in Meerut, he is a proud alumnus of Kendriya Vidyalaya. An officer of the Corps of Signals, he has served across the North East, J&K, and the Western Sector, gaining diverse operational experience. Known for his calm temperament and approachable nature, he is a dependable guide for juniors. A versatile sportsman and a keen volleyball player, he balances professional commitment with family life." },
    { name: "Abhishek Singh", rank: "Sqn Ldr", unit: "F(P)", birthday: "03 Feb", spouse_name: "Mrs. Palak Sambyal", spouse_birthday: "16 May", anniversary: "07 Nov", bio: "Fondly known as \'Pats,\' this helicopter pilot skillfully navigates not just the skies but also academics, exams, and deadlines \\– one steady day at a time. Around campus, he is known for sharing stories, exchanging experiences, and quietly scouting for vada pav or a refreshing cup of chai. Calm under pressure, analytical in thought, and happy-go-lucky by nature, he balances professionalism with warmth. Married to Mrs. Palak Sambyal, a teacher and entrepreneur, weekends often find them exploring the best food and vibrant spots across Pune." },
    { name: "Pritam Singh Jaitawat", rank: "Sqn Ldr", unit: "Administration", birthday: "23 Oct", spouse_name: "Mrs Asha Shekhawat", spouse_birthday: "10 Nov", anniversary: "22 Nov", bio: "From the sands of Rajasthan to the skies with the Garuds, he carries a strong belief that discipline always triumphs over drama and that true character reveals itself under pressure. Calm, determined, and dependable, he performs best when the stakes are highest. If DSTSC were a game of thrones, he would undoubtedly be the Drogo of the game \\– quietly formidable, resolute, and respected for his strength of character and unwavering resolve." },
    { name: "Bhuwan Bhardwaj", rank: "Major", unit: "Armoured Corps", birthday: "04 Jan", spouse_name: "Mrs Bhawna Joshi", spouse_birthday: "11 Aug", anniversary: "30 Jan", bio: "An Armoured Fighting Vehicles specialist with a quiet, observant presence, he is fondly known as the \'silent wolf\' of the pack \\– speaking little but noticing everything. A passionate trekking enthusiast, he seemed determined not to leave a single hill around campus unexplored. An avid reader and photography lover, he also made occasional appearances at the squash court and gym. During the course, the couple was blessed with a baby girl, adding a delightful new mission to his life." },
    { name: "Abhishek Chaturvedi", rank: "Major", unit: "Mechanised Infantry", birthday: "27 Feb", spouse_name: "Mrs Anjali Chaturvedi", spouse_birthday: "02 Feb", anniversary: "26 Nov", bio: "Abhishek Chaturvedi is calm, curious, and quietly competitive by nature. By day, he decodes military technology; by night, he travels, parties, and enjoys evening walks with his wife and two Labradors who clearly outrank him and set the route, pace, and post-walk juice ritual. An \'A\' vehicle specialist, he was a badminton and squash enthusiast." },
    { name: "Swapnil Jadhav", rank: "Major", unit: "Army Air Defence", birthday: "01 Jul", spouse_name: "Maj Rohini Aher", spouse_birthday: "23 Sep", anniversary: "26 Dec", bio: "Maj Swapnil Jadhav is a calm, methodical officer who approaches military technology and staff work with the same seriousness he brings to his daily badminton battles. A regular on the basketball court, he firmly believes experience matters more than stamina. Academically inclined and operationally grounded, he prefers clear logic, practical solutions, and systems that actually work. At home, however, he answers to a far more efficient command structure, his wife, a Medical Officer at NDA." },
    { name: "Amber Saxena", rank: "Major", unit: "Mechanised Infantry", birthday: "30 Jan", spouse_name: "Mrs Amita Rathi", spouse_birthday: "18 Nov", anniversary: "30 Jan", bio: "Maj Amber Saxena is a fun-loving officer with a carefree attitude, yet he approached the course with sincerity and determination. Making the most of his time in Pune, he explored many of the region\'s famous ghats and scenic routes, reflecting his love for travel and adventure. On the sports field, his towering height and impressive skills greatly strengthened the Cariappa Division\'s basketball team, making him a valuable presence both on and off the court." },
    { name: "Lokesh Singh Tanwar", rank: "Major", unit: "Regiment of Artillery", birthday: "31 Oct", spouse_name: "Mrs Maitri Tanwar", spouse_birthday: "26 Sep", anniversary: "15 Apr", bio: "Meet Maj Lokesh Tanwar, a self-styled techie and graduate of National Defence Academy, known for his quiet efficiency and results-driven approach. Cheerful, approachable, and calmly confident, he believes in achieving more output with minimal input. An active sportsman who enjoys squash and badminton, he combines athletic discipline with an energetic social spirit \\– rarely leaving a single cafe, or party spot unexplored wherever he goes." },
    { name: "Himanshu Shekhar", rank: "Major", unit: "Regiment of Artillery", birthday: "27 Dec", spouse_name: "Mrs Akanksha Shekhar", spouse_birthday: "12 Jun", anniversary: "05 Feb", bio: "Hailing from Tarapur, Bihar, the officer serves in the Regiment of Artillery (SATA), demonstrating professionalism and technological proficiency in surveillance and target acquisition. Passionate about exploring new places, he believes travel broadens perspective and enriches experience. Guided by the motto \'Keep calm, be peaceful, and love life,\' he carries a composed and positive outlook, balancing professional commitment with a simple, content approach to life." },
    { name: "Abhijit Boruah", rank: "Major", unit: "Regiment of Artillery", birthday: "24 Jul", spouse_name: "Mrs Poonam Kalita Boruah", spouse_birthday: "27 Mar", anniversary: "07 Oct", bio: "Hailing from Assam, Abhijit Boruah enjoys a fulfilling family life with his supportive wife and their toddler, Raamit. An enthusiast of racquet sports, he balances physical activity with creative pursuits, finding expression through portrait sketching and playing the violin. Calm, curious, and quietly driven, he approaches life with balance and steady enthusiasm, blending discipline with artistic sensitivity." },
    { name: "Pranay Rawat", rank: "Major", unit: "Corps of Engineers", birthday: "27 Jan", spouse_name: "Mrs Agrima Rauthan Rawat", spouse_birthday: "09 Oct", anniversary: "03 Dec", bio: "Pranay Rawat is a focused and inquisitive individual with a strong interest in science, technology, and defence-related subjects. Known for his disciplined approach and curiosity for learning, he constantly strives to broaden his knowledge and skills. An avid football and tennis player, he values teamwork, perseverance, and physical fitness. Firm in his belief that there are no shortcuts to success, he approaches every challenge with dedication, hard work, and determination." },
    { name: "Vineet Jakhmola", rank: "Major", unit: "Corps of Signals", birthday: "11 Feb", spouse_name: "Mrs Utkarsha Jakhmola", spouse_birthday: "12 Mar", anniversary: "14 Apr", bio: "An energetic yet calm and composed personality, he constantly seeks knowledge and new experiences in life. A true nature lover, he often turns to the outdoors to reconnect and find inner peace. A traveller at heart and a dreamer by spirit, he enjoys exploring new places while spreading positivity among those around him. A devoted family man, he balances personal warmth with professional excellence. As a signaller, scholar, and technocrat, he represents a rare blend of intellect, technical proficiency, and grounded values." },
    { name: "Rakesh Kumar", rank: "Major", unit: "Army Ordnance Corps", birthday: "07 Jul", spouse_name: "Mrs Sapna", spouse_birthday: "25 Apr", anniversary: "11 Apr", bio: "Lean by build and light on his feet, Rakesh is the kind of person who walks into a room and quietly lifts the mood. Powered by humour and perfectly timed leg-pulling, he keeps conversations lively and people smiling. Known as the go-to man, he is relied upon equally for practical help and well-placed jokes. Comfortably balanced between sports and studies, he handles both with ease. A notably good tea maker, he believes most problems sound smaller after a cup. Spiritual by nature and an occasional yoga man, he balances inner calm with outward humour." },
    { name: "Devesh Sharma", rank: "Major", unit: "Regiment of Artillery", birthday: "01 Oct", spouse_name: "Mrs Ekta Sharma", spouse_birthday: "23 May", anniversary: "30 Apr", bio: "Being the junior most officer of the Cariappa Division, the officer is often found helping the Div senior in keeping accounting of other officers of Division. A simple, sincere and hardworking guy who is always ready to help others and loves to discuss topics of self improvement. He has been a single point of contact for sharing of presentations just before exams. Loves to party and explore food joints of Pune." },
    { name: "Miguel Omar Figueroa", rank: "Colonel", unit: "Mexico Air Force", birthday: "17 Jan", spouse_name: "Mrs Claudia Garduno", spouse_birthday: "19 Jun", anniversary: "30 Dec", bio: "Col Omar Figueroa of the Mexican Air Force is a distinguished meteorology specialist with a Bachelor\'s in Meteorology, a Bachelor\'s in Military Management, and a Master\'s in Strategic Management. Blending scientific precision with strategic foresight, he contributes significantly to operational planning and decision-making. Beyond uniformed duties, he is an avid soccer player and enjoys movies, long walks, and reading \\– balancing analytical depth with energy, curiosity, and a well-rounded outlook on life." },
    { name: "Ushan Kariyawasam", rank: "Lt Col", unit: "Sri Lanka Army", birthday: "10 Aug", spouse_name: "Mrs Dilhani Mohotti", spouse_birthday: "20 Jul", anniversary: "23 Oct", bio: "Lt Col Ushan Kariyawasam was commissioned into the Sri Lanka Signal Corps after earning a BSc in Electrical and Electronic Engineering. Over a 24-year career, he has held several operational and technical appointments, including commanding the 3rd Regiment of the Sri Lanka Signal Corps. A frequent visitor to India, he regards it as a second home and values the professional and cultural experiences gained there. He is supported by his wife, Mrs. Dilhani, a Nursing Officer. Together with their two daughters, they form a close-knit family." },
    { name: "Samuel Munyasa Eratsia", rank: "Major", unit: "Kenya Army", birthday: "28 Jun", spouse_name: "Mrs Teresia Nandunda Wamalwa", spouse_birthday: "31 May", anniversary: "19 Apr", bio: "Samuel is an Infantry Officer of the Kenya Defence Forces with 19 years of service. He has served in multinational operations under the African Union and United Nations, commanding troops with AMISOM and later serving as a Military Observer with MINUSCA. He is currently a Staff Officer (Operations) at Army Headquarters, with professional interests in operational planning and leadership. He is married and blessed with two children, a daughter and a son." },
    { name: "David Chitumbi", rank: "Major", unit: "Tanzania Army", birthday: "02 Jan", spouse_name: "Mrs Kijakazi Marjeby", spouse_birthday: "24 Jun", anniversary: "03 Nov", bio: "Maj David Chitumbi is a Tanzanian Army officer specialising in Infantry Tactics and currently attending the Defence Services Technical Staff Course-08 at MILIT. An emerging scholar, he holds a BA in Development Studies, a PGD in Diplomatic Protocol, and an MA in Strategic and Peace Studies. His interests span military affairs, leadership, and conflict management. He balances professional dedication with his roles as a devoted husband, father, and committed citizen." },
    { name: "Faida John Manyama", rank: "Major", unit: "Tanzania Air Force", birthday: "08 Dec", spouse_name: "Mrs Theresia Manyama", spouse_birthday: "24 May", anniversary: "28 Sep", bio: "Commissioned into the Tanzania People\'s Defence Force in 2009, he began his career at 601 Air Base as an Air Defence specialist, serving there with distinction until 2018. He was subsequently posted to the School of Air Defence as an Instructor (2018-2023), shaping the next generation of professionals through training and mentorship. Since 2023, he has been serving at Force Headquarters in the Operations Office as an Air Staff Officer." },
  ]),

  // ── MANEKSHAW DIVISION ──
  ...buildSOExt("Manekshaw", "man", [
    { name: "Harsimran Singh Mangat", rank: "Wg Cdr", unit: "AE (L)", birthday: "17 Sep", spouse_name: "Sqn Ldr Rajpreet Randhawa", spouse_birthday: "01 Sep", anniversary: "19 Feb", bio: "Wing Commander Mangat is the senior of the Manekshaw Division and a razor-sharp Electronic Warfare officer who balances authority with warmth. He can move from strict instructor to full on Bhangra coach in seconds, keeping morale high during long stretches of study. A keen tennis player who leads by example, he has a knack for turning tense moments into laughter. His leadership blends operational precision with human touch. He is widely respected and loved for steady guidance and bright spirit." },
    { name: "Rahul Nair", rank: "Wg Cdr", unit: "AE (L)", birthday: "18 May", spouse_name: "Sqn Ldr Vidisha", spouse_birthday: "06 Feb", anniversary: "09 Sep", bio: "A quiet, composed and deeply observant aviator who believes in listening more than speaking. Rahul specialises in the Jaguar fleet and brings technical depth combined with philosophical curiosity. He contributes measured, thoughtful insights when he speaks and steadies heated debates with calm clarity. An old fashioned gentleman with a modern technical edge, he is a stabilising presence in the cohort. Colleagues appreciate his quiet competence and reflective manner." },
    { name: "Deepak Kandpal", rank: "Cdr", unit: "Engineering", birthday: "07 Dec", spouse_name: "Mrs Neha", spouse_birthday: "06 Aug", anniversary: "24 Aug", bio: "Senior Naval officer and proud last bencher monarch whose energy fills the room. Deepak is a dawn runner, gym regular and the sort who makes breaks feel like ritual time. Loud in spirit but warm in friendship, he motivates others by sheer presence and infectious enthusiasm. He combines fitness discipline with a playful streak, keeping the course lively. A memorable character who blends hard work with high spirits." },
    { name: "Abhimanyu Kumar", rank: "Cdr", unit: "Engineering", birthday: "27 May", spouse_name: "Mrs Manjima", spouse_birthday: "30 Dec", anniversary: "30 Nov", bio: "Abhimanyu began quietly and then became a dependable friend and helper to many. Soft spoken and always smiling, he puts people at ease and resolves problems with calm competence. He blends professional steadiness with human warmth and is often the person people turn to for support. Approachable and sincere, he is a quietly strong presence in both academics and daily life." },
    { name: "Chekuri Satyanarayana Varma", rank: "Cdr", unit: "Executive Branch", birthday: "01 Jun", spouse_name: "Mrs Divya Raju", spouse_birthday: "11 Oct", anniversary: "26 Aug", bio: "C S Varma is the course entertainer and a genuine sports all rounder who plays golf and volleyball with equal flair. Known as the Joker King, he keeps the classroom awake with well timed humour while still delivering on performance. His sporting skill and cheerful banter relieve tension and bind the group together. Warm, irrepressible and widely liked, he is the life of many gatherings. He balances fun with focus effortlessly." },
    { name: "Harshvardhan Singh Nathawat", rank: "Cdr", unit: "Education Branch", birthday: "13 Jun", spouse_name: "Mrs Nalini", spouse_birthday: "26 Jan", anniversary: "29 Jan", bio: "Harshvardhan is the Navy education officer admired for depth of knowledge, humility and patience. A true Hukum from Rajasthan, he asks incisive operationally relevant questions and helps juniors with calm clarity. He values hands on learning and practical application and explains difficult topics with ease. Soft spoken and always attentive, he is a go-to mentor for academic rigour and steady leadership." },
    { name: "Narendra Pratap Singh", rank: "Lt Col", unit: "Armoured Corps", birthday: "28 Sep", spouse_name: "Mrs Richa", spouse_birthday: "09 Jun", anniversary: "26 Apr", bio: "The lone Armoured Corps representative in the division, Narendra combines a tall dignified presence with tech savvy curiosity. Soft spoken and unflappable, he enjoys technical conversation and keeps discussions grounded in practical know how. He brings quiet dignity and gentle humour to the course and is comfortable mentoring juniors. A gentleman officer who balances operational insight with an easy charisma." },
    { name: "Vikas Ahlawat", rank: "Lt Col", unit: "ASC", birthday: "21 Oct", spouse_name: "Mrs Jyoti", spouse_birthday: "07 Dec", anniversary: "13 Dec", bio: "A patient and steady ASC officer who listens attentively and helps without fuss. Vikas is consistently prepared in class and builds friendships with small acts of reliability. Calm, courteous and dependable, he makes logistical complexity feel manageable and supports his team quietly. His approachable manner makes him a trusted colleague and reliable associate." },
    { name: "Rajat Singha", rank: "Lt Col", unit: "Corps of EME", birthday: "17 Sep", spouse_name: "Mrs Akshee Singha", spouse_birthday: "22 Nov", anniversary: "14 Oct", bio: "An energetic EME officer with boundless curiosity and a can do spirit. Rajat volunteers for activities, asks probing technical questions and participates eagerly in sports. His interest in emerging technologies complements his workshop savvy and keeps the technical debate lively. Friendly and driven, he shares insights generously and helps the team extract maximum value from the course. A proactive and bright technical asset." },
    { name: "Bhuvan Chandra Joshi", rank: "Lt Col", unit: "Regiment of Artillery", birthday: "26 Jul", spouse_name: "Mrs Kavita Joshi", spouse_birthday: "01 Dec", anniversary: "20 May", bio: "A first bench stalwart who pursues understanding until concepts are crystal clear. Bhuvan asks doubts repeatedly with great patience and humility, ensuring the entire group moves forward together. Soft spoken and diligent, he balances curiosity with steady perseverance. His commitment to learning and gentle nature make him a respected peer and reliable student leader." },
    { name: "Tarun Tiwari", rank: "Cdr", unit: "Executive Branch", birthday: "27 Dec", spouse_name: "Mrs Shraddha", spouse_birthday: "22 May", anniversary: "01 Feb", bio: "Tarun is a mature Naval officer with a trademark smile who brings steady grace to the front rows. Attentive and interactive, he values balance and thoughtful solutions. Practical, pleasant and approachable, he contributes calmly to discussion and builds rapport easily. A smiling sailor with a warm manner and dependable judgement." },
    { name: "Abhishek Kumar Rai", rank: "Cdr", unit: "Logistics", birthday: "24 Apr", spouse_name: "Mrs Priya Bhadauria", spouse_birthday: "25 Dec", anniversary: "21 Nov", bio: "An EW specialist and gifted presenter who uses animation and humour to make technical material memorable. Abhishek pairs deep technical knowledge with engaging delivery and is also a strong basketball player. Friendly and collaborative, he lifts the mood in class and is always ready to assist colleagues with creative explanations. A warm and inventive technical mind." },
    { name: "Jyoti Sharma", rank: "Lt Col", unit: "ASC", birthday: "01 Apr", spouse_name: "Lt Col Anadi Jyoti Singh", spouse_birthday: "13 Aug", anniversary: "19 Aug", bio: "The division fitness icon and a favourite of many instructors, Jyoti runs long distances at sunrise and leads by example. Her discipline, cheerful demeanour and love of pets make her an inspiring role model. She motivates others to adopt healthier routines and approaches training with consistent determination. Warm, encouraging and admirable in her commitment to fitness and fieldcraft." },
    { name: "Yankush Ahlawat", rank: "Lt Col", unit: "Infantry", birthday: "26 Jan", spouse_name: "Mrs Pushpa Ahlawat", spouse_birthday: "14 Feb", anniversary: "19 Nov", bio: "A man of few words and sharp precision, Yankush is a fit Para officer and the division trial officer. He shares practical insights with calm authority and is renowned for his crisp operational anecdotes. Disciplined, athletic and quietly commanding, he uses logic to cut through noise and provides steady guidance. A silent storm of competence and trusted mentor." },
    { name: "Dipin Duhan", rank: "Lt Col", unit: "Infantry", birthday: "11 Nov", spouse_name: "Mrs Rashmi Pundir", spouse_birthday: "19 Nov", anniversary: "11 Mar", bio: "Soft spoken and analytical, Dipin asks the clarifying questions that tidy up projects and discussions. He values accuracy, deep thinking and practical solutions. Fit and disciplined, he contributes calmly and reliably. His steady logic anchors group decisions and reassures peers with thoughtful perspective. A dependable, methodical officer." },
    { name: "Shashank Sharma, SM", rank: "Lt Col", unit: "Infantry", birthday: "19 Mar", spouse_name: "Mrs Iram Khan", spouse_birthday: "30 Jun", anniversary: "27 Jan", bio: "A dignified infantry officer and Sena Medal recipient who leads through quiet example and firm integrity. Shashank blends humility with operational excellence and mentors juniors with patience. He maintains high standards and remains composed under pressure." },
    { name: "Nitish Dogra", rank: "Lt Col", unit: "Infantry", birthday: "11 Nov", spouse_name: "Mrs Shivani Dogra", spouse_birthday: "07 Mar", anniversary: "22 Jan", bio: "Affectionately compared to a film star \'Jimmy Shergill\', Nitish carries charm and composure with academic seriousness. He studies diligently while projecting an easy going first bench cool. Friendly, quietly competitive and reliable, he surprises peers with steady results. Engaging and approachable, he blends calm confidence with strong scholarship." },
    { name: "Anurag Kanwar", rank: "Lt Col", unit: "Infantry", birthday: "19 Aug", spouse_name: "Mrs Neha Rathore", spouse_birthday: "10 Jul", anniversary: "22 Jan", bio: "Called the confused man in jest, Anurag is actually one of the most sincere and curious officers around and now an AI expert performing his research to the extreme professionalism. His questions reveal thoughtful routes to new understanding and he brings warm humility to every discussion. Honest and kind, he fosters comfortable collaboration and thoughtful debate. A genuinely good natured and dependable teammate." },
    { name: "Siddharth Bahadur", rank: "Lt Col", unit: "Infantry", birthday: "06 Dec", spouse_name: "Mrs Nisha Bahadur", spouse_birthday: "16 Apr", anniversary: "18 Feb", bio: "A cheerful dynamo who energises sports and study alike, Siddharth excels in basketball and badminton. Always visible and always smiling, he lifts morale and participates enthusiastically in activities. Curious, fit and sociable, he bridges academics and athletics with equal zeal. A morale booster who brings genuine warmth to the cohort." },
    { name: "Kamlesh Mani", rank: "Major", unit: "Mechanised Infantry", birthday: "23 Nov", spouse_name: "Mrs Priyanka Mani", spouse_birthday: "08 Jun", anniversary: "29 May", bio: "A smart and selective officer who invests energy where it matters most. Kamlesh prefers quiet family evenings and sings by night while delivering strong performance when called upon. Efficient, steady and unflappable, he quietly achieves results without fuss. A calm professional who values substance over spotlight." },
    { name: "Nitish Kumar", rank: "Major", unit: "Mechanised Infantry", birthday: "05 Jun", spouse_name: "Mrs Vishakha Singh", spouse_birthday: "06 Dec", anniversary: "28 Jun", bio: "A whirlwind of conversation with a special interest in AI who keeps dialogue lively and insightful. Nitish blends witty commentary with serious curiosity and is never shy to share opinions. He recently authored and submitted an IEEE research paper and shares academic milestones with infectious pride. Bright, talkative and engaging, he is impossible to ignore." },
    { name: "Kartik Sharma", rank: "Major", unit: "Mechanised Infantry", birthday: "06 Oct", spouse_name: "Maj Harshita", spouse_birthday: "16 Nov", anniversary: "21 Apr", bio: "Kartik hails from the serene hills of Himachal Pradesh, and he carries that calm into every challenge. Disciplined both academically and physically, he scales problems with grace. An avid learner, he approaches every day as if it were a trek to the summit \\– steady, focused, and determined. Even after a long day, he might still outlast the rest in a friendly game of endurance or discussion." },
    { name: "Sumit Sharma", rank: "Major", unit: "Infantry", birthday: "06 Oct", spouse_name: "Mrs Sandhya Sharma", spouse_birthday: "19 Nov", anniversary: "11 Nov", bio: "Recently promoted and encouraging, Sumit praises good work openly and motivates others through example. He is prepared, articulate and supportive, bringing clear thinking into class. Cheerful and practical, he lifts group morale and guides juniors positively. A steady leader who blends warmth with competence. A mountaineering expert and a wonderful company to be around." },
    { name: "Gaurav Singh Rathour", rank: "Major", unit: "Infantry", birthday: "08 Aug", spouse_name: "Mrs Shivani Rathour", spouse_birthday: "11 Dec", anniversary: "05 Feb", bio: "An energetic infantry officer with a strong passion for basketball and sports. He enjoys life fully while maintaining professional competence in his domain. Friendly, approachable, and well-liked, he interacts easily with everyone and carries himself with confidence and warmth. If enthusiasm were contagious, Gaurav would have already made the whole division invincible." },
    { name: "Deepak Tyagi", rank: "Major", unit: "Regiment of Artillery", birthday: "28 May", spouse_name: "Mrs Basu", spouse_birthday: "05 Jan", anniversary: "19 Nov", bio: "An LGSE qualified artillery officer who is alert and engaged in class and well respected for technical mastery. Deepak attempts jokes with cheerful persistence and maintains a respectful, warm demeanour. He balances family life, including twins, with professional rigor and is admired for steady competence. Bright, earnest and good natured." },
    { name: "Samarth A Naik", rank: "Major", unit: "Regiment of Artillery", birthday: "06 Aug", spouse_name: "Mrs Ankita", spouse_birthday: "05 Jun", anniversary: "23 Nov", bio: "A tall and bright artillery officer who combines academic strength with sporting ability. Samarth participates actively in class and on the field and lifts spirits with well timed humour. Family oriented and professional, he balances ambition with friendly approachability. A promising and engaging young leader." },
    { name: "Kapil Kumar", rank: "Major", unit: "Regiment of Artillery", birthday: "20 Dec", spouse_name: "Mrs Preeti Singh", spouse_birthday: "31 Mar", anniversary: "11 May", bio: "Maj Kapil Kumar is a disciplined and methodical artillery officer who strongly believes in preparation and punctuality. Calm and focused by nature, he approaches academics and professional responsibilities with consistency and sincerity. A proper family man at heart, he balances service commitments with personal values seamlessly. Known for his dependable work ethic and steady temperament, he prefers quiet efficiency over attention." },
    { name: "Janardhan Gaikwad", rank: "Lt Col", unit: "Corps of Engineers", birthday: "20 Jan", spouse_name: "Mrs Shital Gaikwad", spouse_birthday: "22 Sep", anniversary: "04 Dec", bio: "A high energy sapper known for initiative and tireless networking. Janardhan manages multiple groups smoothly and is always first to volunteer and organise. Charismatic and hands on, he gets things done and keeps activity momentum high across the cohort. A proactive organiser who inspires participation with contagious drive." },
    { name: "Harvinder Singh", rank: "Major", unit: "Corps of Engineers", birthday: "26 Nov", spouse_name: "Mrs Rupinder Kour", spouse_birthday: "28 May", anniversary: "08 Mar", bio: "Maj Harvinder Singh is a sincere and driven Engineer officer known for energy, discipline, and ownership. Happily married and deeply family-oriented, he values balance between duty and home. A keen sportsman, he actively participated in and organised major sporting and course events. He enjoyed his role in planning tours, get-togethers, and activities that kept the course united." },
    { name: "Siddhant Dogra", rank: "Major", unit: "Corps of Signals", birthday: "30 Aug", spouse_name: "Mrs Siddhant Dogra", spouse_birthday: "11 Jun", anniversary: "04 Feb", bio: "A sharp Signal officer who amusingly naps in class yet never misses a session. When he wakes he fires off precise core specific questions that sharpen debate. He always carries a novel and reads between lectures, pairing literary curiosity with technical acumen. Punctual, academically strong and quietly brilliant, he is a memorable silent sharpness in the cohort." },
    { name: "Ajay Kumar", rank: "Major", unit: "Army Aviation", birthday: "03 Nov", spouse_name: "Mrs Indu Sharma", spouse_birthday: "24 Oct", anniversary: "16 Jan", bio: "A serious intellectual who moved from Signals to Army Aviation and brings analytical precision to every discussion. Ajay balances long commutes and study with stoic discipline and delivers thoughtful contributions on emerging tech. Calm, cerebral and deeply professional, he enriches technical debate with clarity. A committed and focused officer." },
    { name: "Abhay Mukherjee", rank: "Major", unit: "Army Air Defence", birthday: "24 Jul", spouse_name: "Mrs Mandeep Kaur", spouse_birthday: "15 Aug", anniversary: "05 Mar", bio: "Known as the Missile Man for deep technical expertise in guided weaponry domains, Abhay prefers substance to limelight. He combines marathon discipline with curiosity for emerging technologies and travel. Quiet, intense and intellectually focused, he lets work and results speak for him. Respected for both skill and humility, he is a steady technical leader." },
    { name: "Robin", rank: "Major", unit: "ASC", birthday: "04 Dec", spouse_name: "Mrs Hina Rohtaki", spouse_birthday: "11 Nov", anniversary: "26 Jun", bio: "A tall and focused ASC professional who prefers preparation to performance. Robin studies consistently and brings practical, methodical solutions to tasks. He balances family life with duty and approaches work with efficiency. Dependable, precise and quietly committed, he is the reliable steady hand in logistics and planning." },
    { name: "Sandip Yadav", rank: "Lt Col", unit: "Corps of EME", birthday: "26 Nov", spouse_name: "Dr Annu Yadav", spouse_birthday: "11 Oct", anniversary: "11 Nov", bio: "Lt Col Sandip Yadav is a calm, disciplined, and quietly efficient EME officer known for his consistency and composed demeanour. He is often among the first to arrive for classes, reflecting his methodical approach to duty. Soft spoken and steady, he contributes thoughtfully without drawing attention to himself. A devoted family man, he values balance in professional and personal life." },
    { name: "Santosh Teela", rank: "Wg Cdr", unit: "F(N)", birthday: "01 Jun", spouse_name: "Sqn Ldr Ashita Mathew", spouse_birthday: "05 Feb", anniversary: "17 Aug", bio: "Wg Cdr Santosh Teela is a quiet, composed, and deeply sincere officer who believes in letting his work speak for itself. A Weapon Systems Officer by specialisation, he prefers function over fanfare and stays well away from the limelight. Rarely seen seeking attention, he is nevertheless respected and admired, especially by juniors, for his steady mentorship and calm guidance." },
    { name: "Dhann Singh", rank: "Wg Cdr", unit: "Administration", birthday: "28 Oct", spouse_name: "Mrs Neelam Kanwar", spouse_birthday: "13 Jan", anniversary: "22 Nov", bio: "A Mention in Despatches decorated officer now Wg Cdr, Dhann hides a sharp analytical mind behind a warm smile. He combines battlefield tempered judgment with cheerful approachability, greeting everyone with courtesy. His calm presence and clear insight make him a respected leader. Approachable and perceptive, he lightens tense moments and offers grounded counsel." },
    { name: "Sagar S Gaur", rank: "Sqn Ldr", unit: "F(P)", birthday: "08 Aug", spouse_name: "Mrs Gurleen Kaur", spouse_birthday: "25 Feb", anniversary: "11 Mar", bio: "An AWACS pilot who brings a sharp sense of humour and quick one liners to the classroom. Sagar asks incisive technical questions and keeps academic discussions lively. Married life and flying duties suit him well and he pairs technical curiosity with an easy going demeanour. A classroom spark who lightens serious topics with wit." },
    { name: "Praveen Kumar", rank: "Sqn Ldr", unit: "F(P)", birthday: "25 Jun", spouse_name: "Mrs Vibhuti Yadav", spouse_birthday: "03 Feb", anniversary: "06 Mar", bio: "A stylish and disciplined helicopter pilot admired for both looks and ability. Praveen is a gym enthusiast, skilled instructor and quietly kept the group united while spending much time at the Officers Mess. He combines operational experience with warm collegiality and leads by modest example. Personable, technically adept and dependable." },
    { name: "Brijesh Kumar Gupta", rank: "Sqn Ldr", unit: "AE (L)", birthday: "17 Aug", spouse_name: "Sqn Ldr Sugadha Kapoor", spouse_birthday: "09 Sep", anniversary: "20 Nov", bio: "The division technical master who explains complex concepts with calm clarity. Brijesh speaks selectively and his words always add sense and substance. Quiet, approachable and highly respected, he is the go to for technical mentoring and patient explanation. A steady mentor who values depth and clarity." },
    { name: "Sagar Avijit Shukla", rank: "Sqn Ldr", unit: "AE (M)", birthday: "28 Oct", spouse_name: "Wg Cdr Anju", spouse_birthday: "05 Nov", anniversary: "02 Dec", bio: "Sagar is a cheerful and stylish officer who enjoys life to the fullest. Always well-dressed and often seen in shades, he is known for his lively humour. He loves interacting with people, cracking jokes, and keeping the atmosphere energetic and upbeat. If smiles had an ambassador, Sagar would serve the term without vacancy." },
    { name: "BMGS Somanatha", rank: "Major", unit: "Sri Lanka Army", birthday: "09 Jun", spouse_name: "Mrs Vishva Madubhani Fernando", spouse_birthday: "04 Dec", anniversary: "16 Sep", bio: "A quietly cheerful Sri Lankan officer who integrates seamlessly and offers gentle, observant support. Somanatha listens more than he speaks and is always ready to help peers in a polite and humble manner. He contributes international perspective and kind camaraderie to the course. Dependable, respectful and warmly engaged in group life." },
    { name: "R Randeniya", rank: "Major", unit: "Sri Lanka Army", birthday: "22 Feb", spouse_name: "Mrs Chamini Weerakkody", spouse_birthday: "25 Mar", anniversary: "11 Jun", bio: "A social connector and festive spirit who keeps the course calendar lively. Randhya attends celebrations, birthdays and gatherings with boundless cheer and strengthens bonds across the cohort. Warm, well connected and convivial, he brings joy and enthusiasm to every event. A friendly international colleague who brightens group dynamics." },
    { name: "Sus Albert Sitinjak", rank: "Major", unit: "Indonesian Air Force", birthday: "23 Sep", spouse_name: "Mrs Dewi Sartika Simamora", spouse_birthday: "12 Jul", anniversary: "28 Apr", bio: "A grounded Indonesian officer known for evening walks, calm demeanour and cultural warmth. Albert is a devoted family man and a thoughtful conversationalist who balances duty with domestic life. Present in class and activities, he brings quiet wisdom and steady presence. Sincere, gentle and approachable, he enriches the international fabric of the course." },
    { name: "Herculano Henriques Nhamitambo Semo", rank: "Major", unit: "Mozambique Air Force", birthday: "24 Aug", spouse_name: "Mrs Joana", spouse_birthday: "24 Aug", anniversary: "24 Aug", bio: "A fit, polite and warm officer from Africa who greets everyone with genuine cheer. Herculano is disciplined in routine and often seen exercising near the sports complex. Jolly by nature and easy to approach, he bridges cultural gaps with courtesy and good humour. His consistent positivity makes him a valued international presence and friend." },
  ]),

  // ── PEREIRA DIVISION (ordered as per seniority) ──
  ...buildSOExt("Pereira", "per", [
    { name: "Puja Jha", rank: "Lt Col", unit: "Intelligence Corps", birthday: "06 Nov", spouse_name: "Lt Col Ujjual (Retd)", spouse_birthday: "28 Jan", anniversary: "24 Nov", bio: "Lt Col Puja is a history-maker, barrier-breaker and quiet force of nature. As the first woman officer from the Intelligence Corps to qualify for this course, she didn\'t just join the ranks \\– she redefined them. Armed with a doctorate in remote sensing and AI-enabled military target mapping, she quite literally sees what others miss. As Course Senior, she mastered the fine art of \'gentle pressure,\' keeping everyone on track with just the right mix of resolve and composure. Leading from the front, and occasionally from orbit." },
    { name: "Gaurav Kukkar", rank: "Wg Cdr", unit: "AE (L)", birthday: "28 Apr", spouse_name: "Mrs Archita Monga", spouse_birthday: "09 Nov", anniversary: "27 Apr", bio: "Avionics software engineer (Su 30 MKI and LCA TEJAS) and Div Senior, famous for producing the by-default all-in report during the fall-in with remarkable efficiency. He also ensures nominations are shared equally among officers \\– no one escapes the system. When off duty, he can be found on the squash court or reading a book." },
    { name: "Pradeep Kumar", rank: "Wg Cdr", unit: "AE (L)", birthday: "29 Apr", spouse_name: "Mrs Sudha Yadav", spouse_birthday: "13 Dec", anniversary: "03 Nov", bio: "A SU-30 specialist Technical Officer who proves that calm and quiet can still be competitive. Soft-spoken by nature and steady in approach, he brings focus both to his work and the volleyball court. When he is not handling technical challenges, you\'ll likely find him outdoors or setting up the perfect spike in a volleyball game." },
    { name: "Govind Singh", rank: "Cdr", unit: "Logistics", birthday: "31 Jul", bio: "A full-on \'Josh\' type officer who refused to let tough academic sessions stay boring, armed with perfectly timed one-liners that could wake even the sleepiest classroom. Off duty, he owned the dance floor, turning every party into an event. Known for his elite fitness levels and his never-ending negotiations with the mess for a fridge, he somehow remained the blue-eyed boy of the Commandant and the Navy faculty." },
    { name: "Ramesh Muddapu", rank: "Cdr", unit: "Logistics", birthday: "23 Jun", spouse_name: "Major Sujani Chettri", spouse_birthday: "17 Dec", anniversary: "09 Dec", bio: "An Electrical Officer and the senior-most Naval officer of the course, always ready to help others learn. Most of the course probably survived thanks to his legendary notes he prepared. Known for his excellent handwriting that could put printed text to shame. When not teaching or writing notes, he enjoys running, playing badminton and chess, and expressing his creative side through painting." },
    { name: "Raghavendra Pratap Solanki", rank: "Cdr", unit: "Engineering", birthday: "25 Sep", spouse_name: "Dr Vartika Singh", spouse_birthday: "16 Apr", anniversary: "09 Jul", bio: "Cdr Solanki is a Technical Officer in the Engineering Cadre of the Indian Navy who keeps machines running and conversations flowing. When not solving technical problems, he is likely in the gym, tracking cricket scores or enjoying good music. He is known for being helpful, energetic, and a natural speaker. Proof that you can fix engines, lift weights and still debate the latest cricket match with equal passion." },
    { name: "Deepak Tomer", rank: "Cdr", unit: "Logistics", birthday: "22 Feb", spouse_name: "Mrs Anukriti", spouse_birthday: "21 Jun", anniversary: "11 Nov", bio: "Deepak Tomer is an avid trekker, he enjoys exploring the unexplored corners of the country and finds great satisfaction in being close to nature and adventure. A passionate motorcycle enthusiast, he prefers bikes over cars for long journeys, embracing the thrill and freedom of the open road. His academic skills earned him the name Purle Trophy winner even before the course ended. A very helpful and soft-spoken person." },
    { name: "Sanjay Kumar Sheorain", rank: "Wg Cdr", unit: "AE (M)", birthday: "19 Jan", spouse_name: "Sqn Ldr Jashan (Retd)", spouse_birthday: "13 May", anniversary: "08 Dec", bio: "A mechanical engineer by training, he has approached life in the Forces much like a well-designed project plan: first came fitness, then specialization, followed by the most successful collaboration of all \\– marrying the perfect partner \\– and finally the proud launch of their wonderful daughter. Ever since, he has been busy ensuring all these systems run smoothly, proving that with the right engineering mindset, even life\'s biggest projects can stay perfectly in balance." },
    { name: "Jithu Stanislaus", rank: "Cdr", unit: "Executive Branch", birthday: "04 Sep", spouse_name: "Mrs Esther Massey", spouse_birthday: "29 Apr", anniversary: "14 May", bio: "A Gunnery Specialist from Kerala who believes in perfect timing \\– especially his famous \'just-in-time\' approach to reach class. A regular in the gym with his personal trainer. Calm, confident, and always composed, he also carries movie-star looks that could easily land him on a film set instead of a parade ground. A perfect mix of precision, fitness, and a little cinematic charm." },
    { name: "Manish Yadav", rank: "Major", unit: "Army Air Defence", birthday: "19 Mar", spouse_name: "Mrs Kaveri Yadav", spouse_birthday: "13 Mar", anniversary: "29 Apr", bio: "Lt Col Manish is an AD officer who is equally at home with gadgets and ground tactics, he is rarely caught off guard. Off duty, he is usually clocking miles on foot \\– more by habit than necessity \\– quietly proving that readiness is second nature." },
    { name: "Mahantesh Biradar", rank: "Lt Col", unit: "Armoured Corps", birthday: "20 Oct", spouse_name: "Dr Ashwini Biradar", spouse_birthday: "31 Aug", anniversary: "06 Jan", bio: "An Armoured Officer with a simple soul and a love for the outdoors. Calm and grounded, he enjoys playing basketball and spending quiet moments reading or listening to music. When the mountains call, he is always ready for a trek and a new adventure." },
    { name: "Shashank Kapil", rank: "Lt Col", unit: "Infantry", birthday: "07 Jan", spouse_name: "Mrs Niharika Badotra", spouse_birthday: "01 Dec", anniversary: "26 Apr", bio: "An Infantry officer by profession and a soldier at heart, he firmly believes that the secret to soldiering is sweat first, think later. Most at home on the training ground, he treats workouts less like a routine and more like a daily festival of push-ups and runs. Always pushing his limits, he also gently reminds everyone else that fitness is not optional \\– it is part of the uniform." },
    { name: "Pankaj Goutam", rank: "Cdr", unit: "Executive Branch", birthday: "18 Oct", spouse_name: "Mrs Priyanka Thapliyal", spouse_birthday: "25 Oct", anniversary: "18 Apr", bio: "An officer from the Naval Armament cadre who lives by \'observe first, speak later\' \\– quietly analyses the entire class like a well-calibrated radar that is always tracking. He may not speak often, but when he does, it is precise, direct, and right on target \\– no small talk, just impact. Off the grid, he swaps sensors for sneakers, a dedicated runner and an all-round sportsman. Calm, composed, and quietly lethal." },
    { name: "Ankit Gaur", rank: "Wg Cdr", unit: "F(P)", birthday: "02 Jan", spouse_name: "Mrs Nisha", spouse_birthday: "24 Jul", anniversary: "21 Feb", bio: "A helicopter pilot with a soft corner for the Air Force, sometimes getting a little sentimental about it. Always attentive in class and never shy to ask questions, curiosity has always been a defining trait. Beyond academics and aviation dreams, life is filled with music, dance, and the joy of outdoor running." },
    { name: "Himanshu Singh", rank: "Wg Cdr", unit: "AE (L)", birthday: "10 Jul", spouse_name: "Lt Cdr Shruti Pandit", spouse_birthday: "20 Jul", anniversary: "12 Jan", bio: "A Su-30 technical officer who believes in living simply, speaking less, and treating everyone with kindness and respect. Known for being equally comfortable with aircraft systems, PowerPoint presentations, and data analysis, he ensures both machines and spreadsheets behave themselves. When not keeping things running smoothly, he enjoys golfing, playing football, and sketching cartoons \\– occasionally proving that technical minds can also be creative." },
    { name: "Deepak Sharma", rank: "Lt Col", unit: "Corps of Signals", birthday: "05 May", spouse_name: "Mrs Komal Ahuja", spouse_birthday: "13 Apr", anniversary: "13 May", bio: "An Ugandan Air Force pilot officer with a sharp interest in fighter aviation, defence strategy, geopolitics, and emerging technologies. Off duty, he enjoys travelling, discovering new cultures, watching educational documentaries, and keeping up with football. Guided by discipline, values, curiosity, and faith, he navigates life much like a pilot \\– with purpose, perspective, and a steady course." },
    { name: "Piyush Chavan", rank: "Lt Col", unit: "Regiment of Artillery", birthday: "29 Dec", spouse_name: "Mrs Pooja Chavan", spouse_birthday: "30 Nov", anniversary: "03 Dec", bio: "An Artillery officer with a soft corner for technology, always seen with a warm smile and positive vibe. During the course, he bravely went from \'Python? Is that a snake?\' to building his first ML model. One of the few officers who quietly achieved the upgrade from Major to Lt Col. Clearly, his coding skills and career both compiled successfully." },
    { name: "Dhairya Kumar", rank: "Lt Col", unit: "Infantry", birthday: "29 Jan", spouse_name: "Maj Kiran", spouse_birthday: "19 Oct", anniversary: "11 Nov", bio: "Lt Col Dhairya is a sincere and enthusiastic learner who strongly believes in continuous self-improvement. An avid reader and passionate cyclist, he approaches life with a cheerful and positive spirit. With the look of a professor and the voice to match, he often sounds like he is about to begin a lecture \\– fortunately for everyone, it is usually an interesting one." },
    { name: "Ravindra Kumar", rank: "Lt Col", unit: "Corps of Engineers", birthday: "27 May", spouse_name: "Mrs Pushpa", spouse_birthday: "14 Aug", anniversary: "18 Apr", bio: "An engineering officer who can deliver presentations for hours without a script, without notes, and occasionally without noticing the clock. Known for his friendly nature and easygoing personality, he balances technical expertise with simple pleasures in life. When not explaining complex engineering ideas, he enjoys spending time reading and gardening \\– proving that he is equally comfortable among books, plants, and PowerPoint slides." },
    { name: "Trimohan", rank: "Wg Cdr", unit: "Logistics", birthday: "04 Mar", spouse_name: "Mrs Shakuntala", spouse_birthday: "10 Sep", anniversary: "06 Nov", bio: "A logistics professional on a constant mission to catch up with niche technologies, one update at a time. A firm believer in leading by example, he is a dependable teammate who prefers quiet efficiency over loud speeches. Soft-spoken and always ready to help, he brings calmness to the table. When he is not moving things from point A to point B, you will likely find him running or perfecting his swing on the golf course." },
    { name: "Simranjeet Singh Raina", rank: "Major", unit: "Infantry", birthday: "18 Jul", spouse_name: "Mrs Navreen Kour", spouse_birthday: "29 Mar", anniversary: "21 Feb", bio: "The Mahar regiment officer with an ever-present smile. A person of few words but deep observation, always focused on the mission. Calm, composed, and soft-spoken until the basketball game starts. Enjoys reading books. He brings positivity, balance, and quiet confidence to everything he does." },
    { name: "Gaurav Kher", rank: "Major", unit: "Infantry", birthday: "27 Apr", spouse_name: "Mrs Kajal Rawat", spouse_birthday: "17 Dec", anniversary: "18 Jun", bio: "A hardcore infantry officer who carries himself with quiet confidence and steady composure. Gaurav blends field soldiering with a thoughtful approach to academics, rarely seeking the spotlight but always delivering when it counts. Known among course mates for his reliability and understated humour, he is the kind of officer who does the work first and talks about it never. A dependable presence in Pereira Division." },
    { name: "Yogendra Singh", rank: "Major", unit: "Regiment of Artillery", birthday: "15 Jun", spouse_name: "Mrs Shashi Kiran", spouse_birthday: "20 Aug", anniversary: "15 Nov", bio: "A Counter-Terrorism and Artillery specialist officer who also doubles up as the one keeping the social scene alive during the course. On the volleyball court, he seems to believe gravity is optional \\– flying to every corner to save the ball. When he is not socialising or diving on the court, he is usually lost in a good book. A perfect mix of action, energy, and intellect." },
    { name: "Naman Sharma", rank: "Major", unit: "Infantry", birthday: "29 Mar", spouse_name: "Mrs Anusmriti P Sharma", spouse_birthday: "27 Dec", anniversary: "07 Dec", bio: "A Bihar Regiment officer who prefers quiet observation over loud participation in class. Often seen reading a book while others are concentrating on lectures. A regular at the gym, he balances intellect with discipline. Quiet in the classroom, but clearly working on both brains and biceps." },
    { name: "Manish Tripathi", rank: "Sqn Ldr", unit: "F(P)", birthday: "01 Apr", spouse_name: "Mrs Pratima Tripathi", spouse_birthday: "19 Jan", anniversary: "20 Nov", bio: "A transport aircraft (C-130) pilot hailing from Prayagraj, known for his love of basketball, bike rides, and reading about flying \\– even when he is not in the cockpit. Famous for dropping witty one-liners at the right moment, he believes in enjoying life to the fullest and never misses a chance to party hard with his course mates." },
    { name: "Ankit Chaudhary", rank: "Major", unit: "Army Ordnance Corps", birthday: "12 Aug", spouse_name: "Major Kanika Mishra", spouse_birthday: "15 Jul", anniversary: "06 Feb", bio: "An Ammunition Technical Officer who knows how to handle pressure both at work and on adventure trails. A self-proclaimed adventure junkie, when not working, you will likely find him in the gym working out. Known for his cheerful spirit and willingness to help others, he believes life is best lived with curiosity and a smile." },
    { name: "Ajinkya Arvind Powar", rank: "Major", unit: "Corps of Signals", birthday: "14 Apr", spouse_name: "Mrs Anjali Powar", spouse_birthday: "24 Jul", anniversary: "26 Feb", bio: "An intellectual officer from Maharashtra who never shows up with an ordinary presentation \\– his well-researched PPTs often look like mini research projects. When the class is not discussing ideas, he is the go-to advisor for the next weekend getaway. Off the academic court, he is equally active on the basketball court, proving he can handle both slides and basketball with ease." },
    { name: "PR Kulkarni", rank: "Sqn Ldr", unit: "AE (M)", birthday: "01 Mar", spouse_name: "Mrs Shweta Kulkarni", spouse_birthday: "20 May", anniversary: "18 Apr", bio: "A Su-30 engineer from Belagavi, better known to all as \'Kullu\'. The class IT in-charge who ensures everything runs smoother than a well-oiled system. When he is not troubleshooting tech, he is either buried in a book, vibing to music, or admiring his ever-growing watch collection. Add to that a knack for cricket and volleyball, and you have got a man who values timing \\– whether it is in code, on the court, or on his wrist." },
    { name: "Ravi Kumar Yadav", rank: "Major", unit: "Infantry", birthday: "25 Oct", spouse_name: "Mrs Anchal", spouse_birthday: "03 Feb", anniversary: "26 Apr", bio: "A Sikh Light Infantry officer, popularly known as \'Yadav Ji\' of the Div, who ensures the class never runs short of humour. Sometimes the laughs come from his quick one-liners, and sometimes from the legendary pullover he proudly wears. On the court, however, the jokes stop as he turns serious about basketball. A perfect blend of wit, warmth, and sporty spirit." },
    { name: "Shibin S", rank: "Major", unit: "Mechanised Infantry", birthday: "23 Aug", spouse_name: "Sqn Ldr Nilopher Khan", spouse_birthday: "07 Nov", anniversary: "02 Dec", bio: "Maj Shibin is a Mechanised Infantry officer belonging to Bangalore who enjoys motorcycling and traveling at full throttle, and running whenever fitness demands it. Currently working hard on six-pack abs \\– ETA yet to be confirmed." },
    { name: "Abhi Jain", rank: "Major", unit: "Mechanised Infantry", birthday: "21 Sep", spouse_name: "Mrs Deepali Jain", spouse_birthday: "03 Nov", anniversary: "15 Dec", bio: "A Mechanised Infantry officer from the City of Lakes, Jaipur, known for being soft-spoken and calm in nature. In class, he quietly produces the neatest notes with handwriting that could make printers jealous. When off duty, he swaps military precision for guitar strings and singing sessions." },
    { name: "Baibhav Ranjan", rank: "Major", unit: "Infantry", birthday: "22 Jan", spouse_name: "Mrs Akanksha Ranjan", spouse_birthday: "05 Sep", anniversary: "29 Nov", bio: "An Infantry officer from Bihar, known for his calm, cheerful nature and thoughtful outlook on life. A firm believer in continuous self-growth and balanced living, he is often found reading books that broaden his perspective and spark new ideas. Quietly curious and reflective, he proves that a good book can be as powerful as good training." },
    { name: "Ravishankar Rajaram Kadam", rank: "Major", unit: "Regiment of Artillery", birthday: "03 Dec", spouse_name: "Mrs Kanupriya", spouse_birthday: "13 Oct", anniversary: "30 Jan", bio: "An Artillery officer who firmly believes volunteering is a lifestyle, especially when it involves organising parties and executing them with military efficiency. In class, he proudly introduces himself as a \'non-tech guy,\' ensuring the atmosphere stays light with his humour. On the basketball court, however, the mood changes quickly \\– particularly if he is not on the playing side." },
    { name: "Vikash", rank: "Major", unit: "Mechanised Infantry", birthday: "09 Jan", spouse_name: "Mrs Vibha Dalal", spouse_birthday: "23 Feb", anniversary: "15 Jan", bio: "An officer from Haryana with full Haryanvi swag, he believes every problem has a simple, practical solution \\– preferably explained in his own straight-to-the-point style. Helpful, approachable, and perceptive, he is the guy people turn to when things get complicated. Known for fixing problems faster than others can finish discussing them." },
    { name: "Vivek Chaudhary", rank: "Major", unit: "Regiment of Artillery", birthday: "11 Oct", spouse_name: "Mrs Shruti Chaudhary", spouse_birthday: "20 Jul", anniversary: "10 Mar", bio: "An Artillery officer who is calm, composed and perfectly measured \\– until a basketball game starts. Then suddenly, he is less \'precision fire\' and more \'full barrage.\' On the court, his reactions rival the guns he commands. In class, though, he is all discipline \\– attentive, curious, and always ready with a well-aimed question." },
    { name: "Mukesh Kumar Gupta", rank: "Major", unit: "Corps of Engineers", birthday: "26 Feb", spouse_name: "Mrs Sarika Gupta", spouse_birthday: "11 Sep", anniversary: "20 Apr", bio: "An Engineering Officer specializing in Combat Engineering and UXO destruction, known for calm determination and quiet professionalism. Beyond duty, he finds joy in singing, sketching, and nurturing life through gardening, reflecting a thoughtful and creative side behind the uniform." },
    { name: "Dipak Singh", rank: "Major", unit: "Infantry", birthday: "17 Nov", spouse_name: "Mrs Neha", spouse_birthday: "05 Feb", anniversary: "14 May", bio: "A proud Dogra officer specializing in jungle warfare. Calm by nature and a man of very few words in class \\– mostly because he has already said everything important in his head. When not navigating the jungle, he is usually navigating through books or the sports field." },
    { name: "Akash Gupta", rank: "Major", unit: "Corps of Engineers", birthday: "23 May", spouse_name: "Mrs Sanjana Gupta", spouse_birthday: "21 May", anniversary: "15 Jan", bio: "Akash is a cheerful and positive individual known for his soft-spoken nature. Friendly and approachable, he enjoys meeting new people and building meaningful connections. An avid reader, he firmly believes learning never stops. He has a keen interest in technology. When he is not buried in a book, you will probably find him on the court playing basketball or volleyball." },
    { name: "Yash Sharma", rank: "Major", unit: "Infantry", birthday: "21 Oct", spouse_name: "Mrs Shilpa Sharma", spouse_birthday: "10 Aug", anniversary: "03 Jul", bio: "Maj Yash is known for his sincerity, strong sense of responsibility, and dependable nature. A committed sportsman, he carries discipline and a positive attitude both on and off the field. During the course, he bravely took on the role of Division Adjutant, somehow managing to keep track of all Division Officers \\– a task many would consider tougher than the course itself. Always extremely helpful and dependable." },
    // Foreign Officers
    { name: "SMT Priyadarshana", rank: "Cdr", unit: "Sri Lanka Navy", birthday: "07 Jan", spouse_name: "Mrs APMJ Bandara", spouse_birthday: "22 Oct", anniversary: "08 Jun", bio: "A Sri Lankan Naval Officer with 22 years of experience and a communication specialist by trade. Known for his calm and soft-spoken nature, he carries his vast experience with quiet confidence. A simple and approachable person, he enjoys reading books and never misses his daily evening walks." },
    { name: "TBVB Bandara", rank: "Cdr", unit: "Sri Lanka Navy", birthday: "21 Feb", spouse_name: "Mrs Ruvini Viraga", spouse_birthday: "31 May", anniversary: "19 Jan", bio: "A Sri Lankan Naval officer and seasoned communications specialist with years of experience. When he is not decoding signals, he is usually decoding movie plots or enjoying his evening walks. With looks that could easily pass for an Indian officer, he occasionally leaves DS guessing about his nationality. Clearly, he communicates well in signals, cinema, and subtle humour." },
    { name: "Anwar Redhwan Bin Lokman Hakim", rank: "Lt Cdr", unit: "Royal Malaysian Navy", birthday: "14 Jul", spouse_name: "Mrs Zulaikha", spouse_birthday: "17 May", anniversary: "16 Nov", bio: "A Naval Officer from Malaysia who ensures nothing in class goes unnoticed \\– mostly because it is all written in his notebook. A keen reader with a calm and composed demeanor, he is always ready to lend a helping hand to those around him." },
    { name: "Dickson Ayaa Afidra", rank: "Major", unit: "Uganda Air Force", birthday: "25 Jul", spouse_name: "Mrs Kyarimpa Doreen Pamella", spouse_birthday: "23 Oct", anniversary: "05 Nov", bio: "An Engineering Officer from the Ugandan Air Force who believes the world is the best classroom. A traveller at heart, he enjoys discovering new cultures, ideas, and the common thread of humanity. A confident orator who understands the power of a well-timed pause, he occasionally turns the Q&A session into a perfect summary of the lecture instead of a question. Passionate about science, technology, and general knowledge." },
    { name: "Emmanuel Byaruhanga", rank: "Major", unit: "Uganda Air Force", birthday: "05 May", spouse_name: "Mrs Kabazarwe Jolly", spouse_birthday: "01 Jan", anniversary: "13 Oct", bio: "An Ugandan Air Force pilot officer with a sharp interest in fighter aviation, defence strategy, geopolitics, and emerging technologies. Off duty, he enjoys travelling, discovering new cultures, watching educational documentaries, and keeping up with football. Guided by discipline, values, curiosity, and faith, he navigates life much like a pilot \\– with purpose, perspective, and a steady course." },
    { name: "Hassan Hussein", rank: "Major", unit: "Maldives National Defence Force", birthday: "04 Jan", spouse_name: "Mrs Aishath Riuxa", spouse_birthday: "04 Feb", anniversary: "01 Apr", bio: "A Maldivian officer with over 28 years of experience, who has spent so much time training in Indian Armed Forces establishments (about 8 years in total) that he could apply for Indian citizenship. The oldest on paper but youngest at heart. Proof that age may add years, but it certainly has not slowed his spirit." },
  ]),
];

// Personnel IDs whose photos have been removed — ALL staff officers
const noPhotoIds = new Set([
  "pers-1", "pers-2",  // Commandant, Dy Commandant
  ...Array.from({ length: 40 }, (_, i) => `pers-so-${i + 1}`),  // All staff officers
]);

// Auto-fill avatar_url for all personnel from Supabase storage (skip removed photos)
export const samplePersonnel: Personnel[] = _rawPersonnel.map((p) => ({
  ...p,
  avatar_url: noPhotoIds.has(p.id) ? null : (p.avatar_url || getPersonnelPhotoUrl(p.id)),
}));

// --- Table of Contents Data ---
// Fixed section entries that don't come from articles (Leadership, special sections)
// Article/poem entries are generated dynamically from published Supabase articles in app/page.tsx

export const fixedTocEntries: TocEntry[] = [
  // ── Leadership ──
  { id: "toc-1", title: "Commandant's Message", page_label: "01", category: "Leadership", type: "feature" },
  { id: "toc-2", title: "Who is Who", page_label: "02", category: "Leadership", type: "section" },

  // ── Sketches & Paintings ──
  { id: "toc-sk", title: "Sketches & Paintings", page_label: "—", category: "Sketches & Paintings", type: "section" },

  // ── MILIT Babies ──
  { id: "toc-mb", title: "MILIT Babies", page_label: "—", category: "MILIT Babies", type: "section", href: "#gallery?cat=Families" },

  // ── Organised Events ──
  { id: "toc-ev", title: "Organised Events", page_label: "—", category: "Organised Events", type: "section" },

];

// Keep sampleTocEntries as alias for backward compatibility (MagazineTrigger etc.)
export const sampleTocEntries: TocEntry[] = fixedTocEntries;

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
  // Prize Ceremony
  { id: "gal-1", title: "Prize Ceremony", category: "Ceremonies", type: "image", aspect_ratio: "landscape", description: "Annual prize distribution ceremony honouring academic and sporting excellence." },
  // CAPSTAR
  { id: "gal-2", title: "CAPSTAR Opening", category: "CAPSTAR", type: "image", aspect_ratio: "landscape", description: "CAPSTAR — the flagship technical symposium of MILIT." },
  { id: "gal-3", title: "CAPSTAR Exhibits", category: "CAPSTAR", type: "image", aspect_ratio: "square", description: "Innovative projects on display at CAPSTAR." },
  // Cultural Evening
  { id: "gal-4", title: "Cultural Evening", category: "Cultural", type: "image", aspect_ratio: "landscape", description: "An evening of performances celebrating talent and camaraderie." },
  // Get Together
  { id: "gal-5", title: "Get Together", category: "Social", type: "image", aspect_ratio: "landscape", description: "Course get-together — bonding beyond the classroom." },
  // Guest Lectures
  { id: "gal-6", title: "Guest Lectures", category: "Guest Lectures", type: "image", aspect_ratio: "landscape", description: "Distinguished speakers sharing insights with the student body." },
  // Sports Events
  { id: "gal-7", title: "Squash Championship", category: "Sports", type: "image", aspect_ratio: "square", description: "Inter-division squash championship." },
  { id: "gal-8", title: "Badminton Championship", category: "Sports", type: "image", aspect_ratio: "portrait", description: "Inter-division badminton championship." },
  { id: "gal-9", title: "Basketball Championship", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Inter-division basketball championship." },
  { id: "gal-10", title: "Tennis Championship", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Inter-division tennis championship." },
  { id: "gal-11", title: "Volleyball Championship", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Inter-division volleyball championship." },
  { id: "gal-12", title: "Golf Championship", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Inter-division golf championship." },
  { id: "gal-13", title: "Inter Div Cross Country", category: "Sports", type: "image", aspect_ratio: "landscape", description: "Inter-division cross country run." },
  // Lake View
  { id: "gal-14", title: "Lake View", category: "Campus", type: "image", aspect_ratio: "landscape", description: "Scenic view of the lake from the MILIT campus." },
  // MILIT Bike Ride
  { id: "gal-15", title: "MILIT Bike Ride", category: "Adventures", type: "image", aspect_ratio: "landscape", description: "Group bike ride organised by the adventure club." },
  // MILIT Hike
  { id: "gal-16", title: "MILIT Hike", category: "Adventures", type: "image", aspect_ratio: "portrait", description: "Trekking through the Western Ghats near Pune." },
  // Ladies Corner
  { id: "gal-17", title: "Ladies Corner", category: "Families", type: "image", aspect_ratio: "landscape", description: "Activities and events from the ladies wing." },
  // MILIT Babies
  { id: "gal-18", title: "MILIT Babies", category: "Families", type: "image", aspect_ratio: "square", description: "The littlest members of the MILIT family." },
  // Artists of MILIT
  { id: "gal-19", title: "Artists of MILIT", category: "Creative", type: "image", aspect_ratio: "portrait", description: "Artwork and creative expression by student officers." },
];
