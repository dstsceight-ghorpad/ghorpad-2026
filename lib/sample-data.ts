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
    { name: "Ananya Pandey", rank: "Wg Cdr", unit: "AE (L)", birthday: "12 Apr", spouse_birthday: "15 Jun", anniversary: "25 Nov" },
    { name: "Manmeet Singh Narang", rank: "Wg Cdr", unit: "F(P)", birthday: "13 Sep" },
    { name: "Chetan Raut", rank: "Wg Cdr", unit: "F(P)", birthday: "08 Nov", anniversary: "07 Dec" },
    { name: "SK Sharma", rank: "Wg Cdr", unit: "AE (M)", birthday: "03 Dec", spouse_name: "Mrs Nupur Chachra", spouse_birthday: "03 Dec", anniversary: "08 Feb" },
    { name: "Anshuman Rai", rank: "Lt Col", unit: "ASC", birthday: "29 Oct", spouse_birthday: "06 Mar", anniversary: "11 Dec" },
    { name: "Shardendu Pandey", rank: "Cdr", unit: "Logistics", birthday: "05 Feb", spouse_birthday: "18 Sep", anniversary: "13 Nov" },
    { name: "Chinthu K V", rank: "Wg Cdr", unit: "AE (L)", birthday: "09 Sep", spouse_name: "Sqn Ldr Kanishka Sharma", spouse_birthday: "26 May", anniversary: "11 Nov" },
    { name: "Phani Sushant", rank: "Cdr", unit: "Executive Branch", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Rishabh Rawat", rank: "Lt Col", unit: "Infantry", birthday: "22 Sep", spouse_birthday: "11 Mar", anniversary: "30 Nov" },
    { name: "Shivam Trivedi", rank: "Wg Cdr", unit: "Logistics", birthday: "19 May", spouse_birthday: "04 Feb", anniversary: "15 Mar" },
    { name: "Sreejesh N", rank: "Cdr", unit: "Engineering", birthday: "10 Jul", spouse_name: "Mrs Shruti Nair", anniversary: "09 Jun" },
    { name: "Gopikrishnan U", rank: "Cdr", unit: "Engineering", birthday: "29 Mar", spouse_name: "Mrs Swati Ramesh", spouse_birthday: "22 Mar", anniversary: "02 Sep" },
    { name: "Pravin Kumar Vinod Rai", rank: "Wg Cdr", unit: "F(N)", birthday: "15 Sep", spouse_name: "Mrs N Sneha", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Ashay Pal", rank: "Lt Col", unit: "Army Air Defence", birthday: "23 Jun", spouse_birthday: "16 Jul", anniversary: "16 Apr" },
    { name: "Dhar Anurag S", rank: "Major", unit: "Corps of Signals", birthday: "04 Dec", spouse_birthday: "25 Jul", anniversary: "12 Oct" },
    { name: "Anuj Kumar", rank: "Major", unit: "Infantry", birthday: "30 May", spouse_birthday: "12 Nov", anniversary: "06 Dec" },
    { name: "Awanendra Pratap Singh", rank: "Major", unit: "Corps of Engineers", birthday: "26 May", spouse_birthday: "28 Dec", anniversary: "12 Dec" },
    { name: "Sumit Singh Sidhu", rank: "Sqn Ldr", unit: "AE (M)", birthday: "28 Oct", spouse_birthday: "05 May", anniversary: "17 Apr" },
    { name: "Amit Kumar", rank: "Major", unit: "Army Ordnance Corps", birthday: "31 Mar", spouse_birthday: "17 May", anniversary: "02 Mar" },
    { name: "Nitish Sharma", rank: "Sqn Ldr", unit: "Administration", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Praneeth H Vishnu", rank: "Major", unit: "Army Air Defence", birthday: "04 Feb", spouse_birthday: "24 Jan", anniversary: "08 Jul" },
    { name: "Harpreet Singh", rank: "Major", unit: "Infantry", birthday: "21 Jun", spouse_birthday: "28 Aug", anniversary: "25 Mar" },
    { name: "Ravi Prakash Singh", rank: "Major", unit: "Mechanised Infantry", birthday: "03 Jan", spouse_birthday: "14 Aug", anniversary: "19 Feb" },
    { name: "Vinay Prakash", rank: "Major", unit: "Infantry", birthday: "18 Nov", spouse_birthday: "11 Aug", anniversary: "18 Apr" },
    { name: "Amit Gill", rank: "Major", unit: "Infantry", birthday: "31 Mar", spouse_birthday: "17 May", anniversary: "02 Mar" },
    { name: "Deepak Yadav", rank: "Major", unit: "Mechanised Infantry", birthday: "07 May", spouse_birthday: "14 Aug", anniversary: "22 Nov" },
    { name: "Harshdeep Singh", rank: "Major", unit: "Regiment of Artillery", birthday: "27 Nov", spouse_birthday: "15 Mar", anniversary: "04 Sep" },
    { name: "Rohit Seth", rank: "Major", unit: "Infantry", birthday: "12 Apr", spouse_birthday: "30 Jan", anniversary: "08 Dec" },
    { name: "Comdt (JG) Pankaj Ghungtyal", rank: "Comdt (JG)", unit: "Indian Coast Guard", birthday: "05 Nov" },
    { name: "Haobam Rahul Singh", rank: "Major", unit: "Infantry", birthday: "15 Aug", spouse_birthday: "20 May", anniversary: "10 Mar" },
    { name: "Bhupesh Yadav", rank: "Major", unit: "Corps of Signals", birthday: "23 Oct", spouse_birthday: "11 Jun", anniversary: "15 Nov" },
    { name: "Ajatshtru Rampal", rank: "Major", unit: "Infantry", birthday: "23 Mar", spouse_birthday: "09 Jan", anniversary: "07 Oct" },
    { name: "Pillai Mithun", rank: "Major", unit: "Regiment of Artillery", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Pushpendra Singh", rank: "Major", unit: "Armoured Corps", birthday: "06 Jun", spouse_birthday: "18 Feb", anniversary: "19 Nov" },
    { name: "Alok Negi", rank: "Major", unit: "Infantry", birthday: "06 Feb", spouse_birthday: "07 Aug", anniversary: "15 Oct" },
    { name: "Ishank Sharma", rank: "Major", unit: "Regiment of Artillery", birthday: "28 Jun", spouse_birthday: "19 Apr", anniversary: "12 Nov" },
    { name: "Shashi Kumar", rank: "Major", unit: "Regiment of Artillery", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Arpit Kumar Upadhyay", rank: "Major", unit: "Mechanised Infantry", birthday: "19 Mar", spouse_birthday: "25 Oct", anniversary: "04 Jul" },
    { name: "Mukul", rank: "Major", unit: "Corps of Engineers", birthday: "11 Jan", spouse_birthday: "19 Feb", anniversary: "21 Apr" },
    { name: "Shakti Kumar Upadhyay", rank: "Major", unit: "Infantry", birthday: "15 Sep", spouse_birthday: "07 Feb", anniversary: "11 Oct" },
    { name: "Alebachew Etana Kusa", rank: "Lt Col", unit: "Ethiopian Army", birthday: "28 Dec", spouse_birthday: "10 Nov", anniversary: "19 Jul" },
    { name: "Kashun Bahiru Wolderufael", rank: "Major", unit: "Ethiopian Air Force", birthday: "07 Apr", spouse_birthday: "01 Aug", anniversary: "29 Apr" },
    { name: "GKDBJ Dissanayake", rank: "Sqn Ldr", unit: "Sri Lanka Air Force", birthday: "11 Jun", spouse_birthday: "14 Sep", anniversary: "08 Feb" },
    { name: "WGPCI Wijisekara", rank: "Sqn Ldr", unit: "Sri Lanka Air Force", birthday: "06 Aug", spouse_birthday: "13 Sep", anniversary: "22 Oct" },
  ]),

  // ── CARIAPPA DIVISION ──
  ...buildSOExt("Cariappa", "car", [
    { name: "Raviraj SR", rank: "Wg Cdr", unit: "AE (L)", birthday: "24 Aug", spouse_name: "Dr Jyotika Rao", spouse_birthday: "01 Mar", anniversary: "16 May", bio: "Commissioned in the AE (L) Branch of the Indian Air Force in 2011, he is an accomplished technocrat with an M.Tech in Aerospace Engineering from IIT Madras. Trained on advanced missile systems with a proven record of professional achievement in SAM systems. An avid sportsman, he is a keen Badminton and Golf player and the proud winner of the 2025-26 MILIT Badminton Singles and Doubles Championships." },
    { name: "Manoj Kumar Gulia", rank: "Cdr", unit: "Logistics", birthday: "14 Sep", spouse_name: "Mrs Ritu", spouse_birthday: "09 Nov", anniversary: "18 Apr", bio: "A passionate cycling enthusiast and an accomplished swimmer, Cdr Manoj brought quiet determination and discipline to the course. Though often silent in class, his sharp understanding of radar and electronics spoke volumes. Calm, composed, and technically proficient, he combined understated confidence with professional expertise." },
    { name: "L Praveen Kumar", rank: "Wg Cdr", unit: "AE (L)", birthday: "13 Jun", spouse_name: "Mrs Gitanjali S", spouse_birthday: "14 Mar", anniversary: "06 Jun", bio: "A highly motivated and diligent officer. He is the recipient of the President's Plaque for standing first in the Order of Merit at both the Air Force Academy and the Air Force Training College. He has served as an Engineering Officer in Su-30 MKI squadrons and at the prestigious Tactics and Air Combat Establishment (TACDE). An avid runner, he also enjoys playing lawn tennis and badminton." },
    { name: "Vivek V Solat", rank: "Cdr", unit: "Engineering", birthday: "04 Aug", spouse_name: "Mrs Sonal", spouse_birthday: "20 Oct", anniversary: "06 Sep", bio: "Hailing from Ahmednagar, this Aviation Engineer is a proud alumnus of Sainik School Satara with a strong Naval Aviation background. An avid reader and keen explorer of local sights, he enjoys discovering new places wherever he goes. During the course, he embraced fatherhood, welcoming the first child of DSTSC-08 at the Military Institute of Technology." },
    { name: "Krishnendu Sanyal", rank: "Cdr", unit: "Education Branch", birthday: "13 Jan", spouse_name: "Mrs Shreya Chakraborty", spouse_birthday: "01 Nov", anniversary: "23 Jan", bio: "An Indian Navy officer specialising in Thermal Sciences and Fluid Mechanics, he holds an MTech in Thermal Engineering. During his MILIT tenure, he was famously the last to arrive each morning while somehow never being caught off guard. Calm and unflappable, with a fondness for movies and travel, he is also remembered for his legendary party spirit." },
    { name: "Kartik Gulati", rank: "Lt Col", unit: "Mechanised Infantry", birthday: "19 Aug", spouse_name: "Mrs Sneha Dey", spouse_birthday: "21 Jul", anniversary: "02 Jul", bio: "As a Mechanized Infantry Officer, his life is defined by the high tempo synergy of man and machine; a world of tactical precision and heavy armour. While his professional life is built on the discipline of leading \"The Iron Fist,\" he finds his necessary balance in the stillness of nature. Whether fishing in quiet waters or tending to his garden, these moments of patience provide a vital contrast to the roar of the engines." },
    { name: "Chandreshwar Manjhi", rank: "Cdr", unit: "Logistics", birthday: "05 Aug", spouse_name: "Dr. Swati", spouse_birthday: "13 Mar", anniversary: "15 Oct", bio: "Calm by default and reserved by habit, the officer is known for his punctuality and meticulously planned approach to every task. Usually quiet and observant, he prefers letting his actions speak for themselves. Polite, considerate, and quietly helpful, he reflects a fine balance between professionalism and personality." },
    { name: "Kushal Sharma", rank: "Wg Cdr", unit: "AE (L)", birthday: "30 Jan", spouse_name: "Sqn Ldr Kinnari Jain", spouse_birthday: "22 Jul", anniversary: "19 Oct", bio: "Rooted in the vibrant spirit of Punjab, this engineer spends his days decoding the complexities of fighter jets and his evenings conquering squash courts, dance floors, and lively gatherings. A sharp and technically adept officer, he is rarely seen without a squash racket in hand or riding his Royal Enfield with unmistakable enthusiasm." },
    { name: "Anurag Pattanayak", rank: "Cdr", unit: "Logistics", birthday: "08 Jun", spouse_name: "Mrs Poorvi Singh", spouse_birthday: "19 Dec", anniversary: "30 Nov", bio: "Popularly known as Pattu, he is a man of layers. To his colleagues, he is the picture of composure. To his friends, he is the guy who hears the word celebration and is already halfway out the door. His favourite way to recharge is hitting the open road with my two favorite ladies, his wife and daughter." },
    { name: "Arjun Singh", rank: "Lt Col", unit: "Infantry", birthday: "17 Aug", spouse_name: "Mrs Deepthi Chauhan", spouse_birthday: "05 Aug", anniversary: "25 Jun", bio: "The formidable Army Senior of Cariappa Division, he was well known for keeping juniors on their toes. An Infantry officer from 4 MAHAR (BORDERS) Regiment, he is a graduate of the GRS Department, Arts Faculty, Delhi University. Happily married since 2018, his wife holds an M.Tech in Computer Science from Anna University." },
    { name: "Akhil BG", rank: "Wg Cdr", unit: "F(P)", birthday: "27 Aug", spouse_name: "Sqn Ldr Swati Vasudev(Retd)", spouse_birthday: "11 Apr", anniversary: "10 Mar", bio: "A tall and lanky helicopter pilot, he is known for his calm and composed demeanour, especially in demanding situations. His quiet confidence and steady temperament reflect the qualities essential for aviation. Despite limited practice, he successfully led the Division's basketball team to a podium finish, using his height, agility, and leadership on the court." },
    { name: "Devidas Amale", rank: "Lt Col", unit: "Intelligence Corps", birthday: "11 Dec", spouse_name: "Mrs Shraddha", spouse_birthday: "13 Nov", anniversary: "13 Aug", bio: "A proud local from Pune and a keen kitchen-garden enthusiast, he is known for his thoughtful demeanour and sharp intellect. With a subtle calm always visible on his face and intense thoughts working beneath the surface, he approaches challenges with quiet confidence. Reliable and perceptive, he combined local knowledge with a composed personality." },
    { name: "Rinson Robinson", rank: "Comdt (JG)", unit: "Indian Coast Guard", birthday: "08 Dec", spouse_name: "Mrs Adelene Jenefer", spouse_birthday: "04 Nov", anniversary: "28 Dec", bio: "The hardened marine engineer with salt in his veins, well versed in propulsion and hull integrity. When not decoding cryptic circuit diagrams or cursing antenna theory, he grabs his GoPro for epic bike rides, turning adrenaline into footage. As his name echoes the rhythm of strings, his hobby of strumming the guitar and belting out sea shanties brings melody to house parties." },
    { name: "Praveen Mishra", rank: "Major", unit: "Regiment of Artillery", birthday: "28 May", spouse_name: "Mrs Rashmi Mishra", spouse_birthday: "05 Sep", anniversary: "07 Dec", bio: "A tall and lean Rimcollian, forever glued to books that lay far beyond the prescribed syllabus. A proficient Gunner officer, he was known for his calm, composed demeanor under all circumstances. An easy-going soul, he remained largely unperturbed by the chaos of life. A meticulous planner and exceptionally well-organised, he was frequently seen dispensing free gyan to juniors." },
    { name: "Navin Kumar", rank: "Major", unit: "Infantry", birthday: "13 Sep", spouse_name: "Dr Shefali Chauhan", spouse_birthday: "02 Nov", anniversary: "28 Jun", bio: "A native of Gorakhpur, this Infantry officer of 8 GR blends field grit with vibrant energy. An adventure seeker with a creative streak, he enjoys tennis, football, and watercolour painting. Often seen at the court, gym, or social gatherings, he is known for his smile and humour. With his wife, a Medical Officer at Tihar Jail in Delhi, he shares his home with two Himalayan Shepherds." },
    { name: "Jaidev Singh", rank: "Major", unit: "Infantry", birthday: "09 Jan", spouse_name: "Lt Cdr Priti Shekhawat", spouse_birthday: "28 Apr", anniversary: "07 Dec", bio: "An Infantry officer who wears his heritage as proudly as his uniform. With over 12 years of distinguished service, he combines operational sharpness with a forward-looking edge through his niche expertise in Python coding and programming. A proud torchbearer of the Rajasthani Rajput Banna spirit, he embodies courage, camaraderie, and cultural pride." },
    { name: "Shwetank Gaur", rank: "Major", unit: "Regiment of Artillery", birthday: "26 Feb", spouse_name: "Mrs Shivani Trivedi", spouse_birthday: "02 Jan", anniversary: "09 Mar", bio: "Commissioned into the 12 Medium Regiment in June 2013, where he gained valuable operational experience in the field. He was later posted to the 122 SATA Regiment, developing strong expertise in Intelligence, Surveillance, and Reconnaissance (ISR) during active operations. He has also served as an Instructor (Class B) at the Indian Military Academy." },
    { name: "Anshul Rana", rank: "Major", unit: "Corps of Engineers", birthday: "09 Nov", spouse_name: "Mrs Devyani Singh", spouse_birthday: "29 Sep", anniversary: "09 Feb", bio: "A Sapper to the core, he embodies the grit, precision, and resilience that define the Corps of Engineers. A passionate golfer and an enthusiastic bike rider, he enjoys the balance of discipline and leisure. Known for his refined taste in celebrations and meaningful conversations, he brings warmth and camaraderie to every gathering." },
    { name: "Ahmed Faraz Ansari", rank: "Sqn Ldr", unit: "F(P)", birthday: "09 Jun", spouse_name: "Mrs Syeda Asma Husaini", spouse_birthday: "23 Dec", anniversary: "26 Jul", bio: "A fighter pilot and Qualified Flying Instructor, he brings precision, discipline, and confidence to both the cockpit and everyday life. Beyond flying, he was often found conducting clandestine ground operations on BGMI, showcasing his competitive spirit even in the virtual battlefield. A dedicated workout enthusiast, he believes strongly in maintaining peak physical fitness." },
    { name: "Lokesh Mehlan", rank: "Sqn Ldr", unit: "AE (M)", birthday: "30 Jan", spouse_name: "Sqn Ldr Swati", spouse_birthday: "20 May", anniversary: "27 Nov", bio: "An AE(M) Officer and a Flight Engineer; among other things, he is an IITian too. A proud JAT who treats the gym as his second squadron, he can lift aircraft manuals and dumbbells with the same discipline. He is married to Sqn Ldr Swati, and they are blessed with two little co-pilots at home." },
    { name: "Mandeep Kumar", rank: "Major", unit: "The Guards", birthday: "18 Jun", spouse_name: "Mrs Nisha Sharma", spouse_birthday: "12 Dec", anniversary: "25 Nov", bio: "A native of Rohtak, this well-built Guards officer balances a demanding course, family life, and Pune with steady determination. Fond of music and basketball, he believes in consistency and quiet effort. Evenings often find him unwinding with his closest friend, Maj Rakesh, whose effortless camaraderie needs no context." },
    { name: "Shiv Kumar Sharma, SM", rank: "Major", unit: "Infantry", birthday: "13 Feb", spouse_name: "Mrs Swati Sharma", spouse_birthday: "21 Sep", anniversary: "02 Aug", bio: "Dynamic Special Forces Officer Maj Shiv Kumar Sharma is sober, hardworking, down-to-earth, universally admired by course mates, juniors, and seniors alike. Avid reader and runner who traded battlefield boots for court conquests: Squash Runner-Up, instrumental in Cariappa Div's epic Basketball Finals charge to runners up position." },
    { name: "Ajay Partap", rank: "Major", unit: "Army Air Defence", birthday: "15 Jan", spouse_name: "Mrs Nikki Rana", spouse_birthday: "08 Nov", anniversary: "27 Feb", bio: "An Air Defence specialist, he is as dynamic in personality as he is in profession. Fond of golf, music, and content creation, he brings energy and creativity to every setting. Known for his trademark desi slang and warm camaraderie, he truly lives up to the phrase yaaron ka yaar. Happily married, he is a proud father to a son." },
    { name: "Ajit Singh", rank: "Major", unit: "Infantry", birthday: "22 Nov", spouse_name: "Mrs Ishali Raina", spouse_birthday: "07 Aug", anniversary: "19 Apr", bio: "An Infantry officer from Karnataka, Ajit has a keen interest in astronomy and space science. Known for his curious mind, he often spent his time gazing at the daytime sky from class, jokingly hoping to spot a few stars. Thoughtful and observant, he is an officer with a sharp eye for detail and a quiet sense of humour." },
    { name: "Amit Kumar Singh", rank: "Major", unit: "Infantry", birthday: "03 Oct", spouse_name: "Mrs Niharika Singh", spouse_birthday: "26 Feb", anniversary: "06 Feb", bio: "An Infantry officer known for his thoughtful nature and simple outlook on life. His personal motto could well be summed up as debating over life and playing badminton, reflecting both his reflective mindset and love for sport. A simple family man at heart, he values peace, balance, and the quiet joys of life." },
    { name: "Gurtej Singh Gill", rank: "Major", unit: "Infantry", birthday: "03 Mar", spouse_name: "Maj Simran Kaur", spouse_birthday: "02 Aug", anniversary: "03 Jul", bio: "A jovial and socially adaptable officer with a keen penchant for reading and continuous learning. Happily married and blessed with two adorable children, he shares a strong bond with his wife, a serving officer. Known for embracing challenges head-on, he constantly strives to test his limits. His positive outlook and easy-going nature make him a pleasant companion." },
    { name: "Vijay Singh Tomar", rank: "Major", unit: "Corps of Signals", birthday: "15 Jan", spouse_name: "Mrs Shweta Sirohi", spouse_birthday: "29 Dec", anniversary: "25 Feb", bio: "A graduate in IT and Telecommunications from Military College of Telecommunication Engineering. Born in Meerut, he is a proud alumnus of Kendriya Vidyalaya. An officer of the Corps of Signals, he has served across the North East, J&K, and the Western Sector. Known for his calm temperament and approachable nature, he is a dependable guide for juniors." },
    { name: "Abhishek Singh", rank: "Sqn Ldr", unit: "F(P)", birthday: "03 Feb", spouse_name: "Mrs. Palak Sambyal", spouse_birthday: "16 May", anniversary: "07 Nov", bio: "Fondly known as Pats, this helicopter pilot skillfully navigates not just the skies but also academics, exams, and deadlines. Around campus, he is known for sharing stories, exchanging experiences, and quietly scouting for vada pav or a refreshing cup of chai. Calm under pressure, analytical in thought, and happy-go-lucky by nature." },
    { name: "Pritam Singh Jaitawat", rank: "Sqn Ldr", unit: "Administration", birthday: "23 Oct", spouse_name: "Mrs Asha Shekhawat", spouse_birthday: "10 Nov", anniversary: "22 Nov", bio: "From the sands of Rajasthan to the skies with the Garuds, he carries a strong belief that discipline always triumphs over drama and that true character reveals itself under pressure. Calm, determined, and dependable, he performs best when the stakes are highest." },
    { name: "Bhuwan Bhardwaj", rank: "Major", unit: "Armoured Corps", birthday: "04 Jan", spouse_name: "Mrs Bhawna Joshi", spouse_birthday: "11 Aug", anniversary: "30 Jan", bio: "An Armoured Fighting Vehicles specialist with a quiet, observant presence, he is fondly known as the silent wolf of the pack. A passionate trekking enthusiast, he seemed determined not to leave a single hill around campus unexplored. An avid reader and photography lover, he also made occasional appearances at the squash court and gym." },
    { name: "Abhishek Chaturvedi", rank: "Major", unit: "Mechanised Infantry", birthday: "27 Feb", spouse_name: "Mrs Anjali Chaturvedi", spouse_birthday: "02 Feb", anniversary: "26 Nov", bio: "Abhishek Chaturvedi is calm, curious, and quietly competitive by nature. By day, he decodes military technology; by night, he travels, parties, and enjoys evening walks with his wife and two Labradors. An A vehicle specialist, he was a badminton and squash enthusiast." },
    { name: "Swapnil Jadhav", rank: "Major", unit: "Army Air Defence", birthday: "01 Jul", spouse_name: "Maj Rohini Aher", spouse_birthday: "23 Sep", anniversary: "26 Dec", bio: "A calm, methodical officer who approaches military technology and staff work with the same seriousness he brings to his daily badminton battles. A regular on the basketball court, he firmly believes experience matters more than stamina. Academically inclined and operationally grounded, he prefers clear logic, practical solutions, and systems that actually work." },
    { name: "Amber Saxena", rank: "Major", unit: "Mechanised Infantry", birthday: "30 Jan", spouse_name: "Mrs Amita Rathi", spouse_birthday: "18 Nov", anniversary: "30 Jan", bio: "A fun-loving officer with a carefree attitude, yet he approached the course with sincerity and determination. Making the most of his time in Pune, he explored many of the region's famous ghats and scenic routes. On the sports field, his towering height and impressive skills greatly strengthened the Cariappa Division's basketball team." },
    { name: "Lokesh Singh Tanwar", rank: "Major", unit: "Regiment of Artillery", birthday: "31 Oct", spouse_name: "Mrs Maitri Tanwar", spouse_birthday: "26 Sep", anniversary: "15 Apr", bio: "A self-styled techie and graduate of National Defence Academy, known for his quiet efficiency and results-driven approach. Cheerful, approachable, and calmly confident, he believes in achieving more output with minimal input. An active sportsman who enjoys squash and badminton, he combines athletic discipline with an energetic social spirit." },
    { name: "Himanshu Shekhar", rank: "Major", unit: "Regiment of Artillery", birthday: "27 Dec", spouse_name: "Mrs Akanksha Shekhar", spouse_birthday: "12 Jun", anniversary: "05 Feb", bio: "Hailing from Tarapur, Bihar, the officer serves in the Regiment of Artillery (SATA), demonstrating professionalism and technological proficiency in surveillance and target acquisition. Passionate about exploring new places, he believes travel broadens perspective and enriches experience. Guided by the motto Keep calm, be peaceful, and love life." },
    { name: "Abhijit Boruah", rank: "Major", unit: "Regiment of Artillery", birthday: "24 Jul", spouse_name: "Mrs Poonam Kalita Boruah", spouse_birthday: "27 Mar", anniversary: "07 Oct", bio: "Hailing from Assam, Abhijit Boruah enjoys a fulfilling family life with his supportive wife and their toddler, Raamit. An enthusiast of racquet sports, he balances physical activity with creative pursuits, finding expression through portrait sketching and playing the violin. Calm, curious, and quietly driven, he approaches life with balance and steady enthusiasm." },
    { name: "Pranay Rawat", rank: "Major", unit: "Corps of Engineers", birthday: "27 Jan", spouse_name: "Mrs Agrima Rauthan Rawat", spouse_birthday: "09 Oct", anniversary: "03 Dec", bio: "A focused and inquisitive individual with a strong interest in science, technology, and defence-related subjects. Known for his disciplined approach and curiosity for learning, he constantly strives to broaden his knowledge and skills. An avid football and tennis player, he values teamwork, perseverance, and physical fitness." },
    { name: "Vineet Jakhmola", rank: "Major", unit: "Corps of Signals", birthday: "11 Feb", spouse_name: "Mrs Utkarsha Jakhmola", spouse_birthday: "12 Mar", anniversary: "14 Apr", bio: "An energetic yet calm and composed personality, he constantly seeks knowledge and new experiences in life. A true nature lover, he often turns to the outdoors to reconnect and find inner peace. A devoted family man, he balances personal warmth with professional excellence. As a signaller, scholar, and technocrat, he represents a rare blend of intellect and grounded values." },
    { name: "Rakesh Kumar", rank: "Major", unit: "Army Ordnance Corps", birthday: "07 Jul", spouse_name: "Mrs Sapna", spouse_birthday: "25 Apr", anniversary: "11 Apr", bio: "Lean by build and light on his feet, Rakesh is the kind of person who walks into a room and quietly lifts the mood. Powered by humour and perfectly timed leg-pulling, he keeps conversations lively and people smiling. Known as the go-to man, he is relied upon equally for practical help and well-placed jokes. Comfortably balanced between sports and studies." },
    { name: "Devesh Sharma", rank: "Major", unit: "Regiment of Artillery", birthday: "01 Oct", spouse_name: "Mrs Ekta Sharma", spouse_birthday: "23 May", anniversary: "30 Apr", bio: "Being the junior most officer of the Cariappa Division, the officer is often found helping the Div senior in keeping accounting of other officers of Division. A simple, sincere and hardworking guy who is always ready to help others and loves to discuss topics of self improvement. He has been a single point of contact for sharing of presentations just before exams." },
    { name: "Miguel Omar Figueroa", rank: "Colonel", unit: "Mexico Air Force", birthday: "17 Jan", spouse_name: "Mrs Claudia Garduno", spouse_birthday: "19 Jun", anniversary: "30 Dec", bio: "Col Omar Figueroa of the Mexican Air Force is a distinguished meteorology specialist with a Bachelor's in Meteorology, a Bachelor's in Military Management, and a Master's in Strategic Management. Blending scientific precision with strategic foresight, he contributes significantly to operational planning and decision-making. Beyond uniformed duties, he is an avid soccer player." },
    { name: "Ushan Kariyawasam", rank: "Lt Col", unit: "Sri Lanka Army", birthday: "10 Aug", spouse_name: "Mrs Dilhani Mohotti", spouse_birthday: "20 Jul", anniversary: "23 Oct", bio: "Commissioned into the Sri Lanka Signal Corps after earning a BSc in Electrical and Electronic Engineering. Over a 24-year career, he has held several operational and technical appointments, including commanding the 3rd Regiment of the Sri Lanka Signal Corps. A frequent visitor to India, he regards it as a second home and values the professional and cultural experiences gained there." },
    { name: "Samuel Munyasa Eratsia", rank: "Major", unit: "Kenya Army", birthday: "28 Jun", spouse_name: "Mrs Teresia Nandunda Wamalwa", spouse_birthday: "31 May", anniversary: "19 Apr", bio: "Samuel is an Infantry Officer of the Kenya Defence Forces with 19 years of service, having joined on 19 January 2007. He has served in multinational operations under the African Union and United Nations. He is currently a Staff Officer (Operations) at Army Headquarters, with professional interests in operational planning and leadership." },
    { name: "David Chitumbi", rank: "Major", unit: "Tanzania Army", birthday: "02 Jan", spouse_name: "Mrs Kijakazi Marjeby", spouse_birthday: "24 Jun", anniversary: "03 Nov", bio: "A Tanzanian Army officer specialising in Infantry Tactics and currently attending the Defence Services Technical Staff Course-08 at MILIT. An emerging scholar, he holds a BA in Development Studies, a PGD in Diplomatic Protocol, and an MA in Strategic and Peace Studies. His interests span military affairs, leadership, and conflict management." },
    { name: "Faida John Manyama", rank: "Major", unit: "Tanzania Air Force", birthday: "08 Dec", spouse_name: "Mrs Theresia Manyama", spouse_birthday: "24 May", anniversary: "28 Sep", bio: "Commissioned into the Tanzania People's Defence Force in 2009, he began his career at 601 Air Base as an Air Defence specialist. He was subsequently posted to the School of Air Defence as an Instructor (2018-2023), shaping the next generation of professionals through training and mentorship. Since 2023, he has been serving at Force Headquarters in the Operations Office." },
  ]),

  // ── MANEKSHAW DIVISION ──
  ...buildSOExt("Manekshaw", "man", [
    { name: "Harsimran Singh Mangat", rank: "Wg Cdr", unit: "AE (L)", birthday: "17 Sep", spouse_name: "Sqn Ldr Rajpreet Randhawa", spouse_birthday: "01 Sep", anniversary: "19 Feb", bio: "The senior of the Manekshaw Division and a razor-sharp Electronic Warfare officer who balances authority with warmth. He can move from strict instructor to full on Bhangra coach in seconds, keeping morale high during long stretches of study. A keen tennis player who leads by example, he has a knack for turning tense moments into laughter." },
    { name: "Rahul Nair", rank: "Wg Cdr", unit: "AE (L)", birthday: "18 May", spouse_name: "Sqn Ldr Vidisha", spouse_birthday: "06 Feb", anniversary: "09 Sep", bio: "A quiet, composed and deeply observant aviator who believes in listening more than speaking. Rahul specialises in the Jaguar fleet and brings technical depth combined with philosophical curiosity. He contributes measured, thoughtful insights when he speaks and steadies heated debates with calm clarity. An old fashioned gentleman with a modern technical edge." },
    { name: "Deepak Kandpal", rank: "Cdr", unit: "Engineering", birthday: "07 Dec", spouse_name: "Mrs Neha", spouse_birthday: "06 Aug", anniversary: "24 Aug", bio: "Senior Naval officer and proud last bencher monarch whose energy fills the room. Deepak is a dawn runner, gym regular and the sort who makes breaks feel like ritual time. Loud in spirit but warm in friendship, he motivates others by sheer presence and infectious enthusiasm. He combines fitness discipline with a playful streak." },
    { name: "Abhimanyu Kumar", rank: "Cdr", unit: "Engineering", birthday: "27 May", spouse_name: "Mrs Manjima", spouse_birthday: "30 Dec", anniversary: "30 Nov", bio: "Abhimanyu began quietly and then became a dependable friend and helper to many. Soft spoken and always smiling, he puts people at ease and resolves problems with calm competence. He blends professional steadiness with human warmth and is often the person people turn to for support." },
    { name: "Chekuri Satyanarayana Varma", rank: "Cdr", unit: "Executive Branch", birthday: "01 Jun", spouse_name: "Mrs Divya Raju", spouse_birthday: "11 Oct", anniversary: "26 Aug", bio: "The course entertainer and a genuine sports all rounder who plays golf and volleyball with equal flair. Known as the Joker King, he keeps the classroom awake with well timed humour while still delivering on performance. His sporting skill and cheerful banter relieve tension and bind the group together." },
    { name: "Harshvardhan Singh Nathawat", rank: "Cdr", unit: "Education Branch", birthday: "13 Jun", spouse_name: "Mrs Nalini", spouse_birthday: "26 Jan", anniversary: "29 Jan", bio: "The Navy education officer admired for depth of knowledge, humility and patience. A true Hukum from Rajasthan, he asks incisive operationally relevant questions and helps juniors with calm clarity. He values hands on learning and practical application and explains difficult topics with ease." },
    { name: "Narendra Pratap Singh", rank: "Lt Col", unit: "Armoured Corps", birthday: "28 Sep", spouse_name: "Mrs Richa", spouse_birthday: "09 Jun", anniversary: "26 Apr", bio: "The lone Armoured Corps representative in the division, Narendra combines a tall dignified presence with tech savvy curiosity. Soft spoken and unflappable, he enjoys technical conversation and keeps discussions grounded in practical know how. He brings quiet dignity and gentle humour to the course." },
    { name: "Vikas Ahlawat", rank: "Lt Col", unit: "ASC", birthday: "21 Oct", spouse_name: "Mrs Jyoti", spouse_birthday: "07 Dec", anniversary: "13 Dec", bio: "A patient and steady ASC officer who listens attentively and helps without fuss. Vikas is consistently prepared in class and builds friendships with small acts of reliability. Calm, courteous and dependable, he makes logistical complexity feel manageable and supports his team quietly." },
    { name: "Rajat Singha", rank: "Lt Col", unit: "Corps of EME", birthday: "17 Sep", spouse_name: "Mrs Akshee Singha", spouse_birthday: "22 Nov", anniversary: "14 Oct", bio: "An energetic EME officer with boundless curiosity and a can do spirit. Rajat volunteers for activities, asks probing technical questions and participates eagerly in sports. His interest in emerging technologies complements his workshop savvy and keeps the technical debate lively." },
    { name: "Bhuvan Chandra Joshi", rank: "Lt Col", unit: "Regiment of Artillery", birthday: "26 Jul", spouse_name: "Mrs Kavita Joshi", spouse_birthday: "01 Dec", anniversary: "20 May", bio: "A first bench stalwart who pursues understanding until concepts are crystal clear. Bhuvan asks doubts repeatedly with great patience and humility, ensuring the entire group moves forward together. Soft spoken and diligent, he balances curiosity with steady perseverance." },
    { name: "Tarun Tiwari", rank: "Cdr", unit: "Executive Branch", birthday: "27 Dec", spouse_name: "Mrs Shraddha", spouse_birthday: "22 May", anniversary: "01 Feb", bio: "A mature Naval officer with a trademark smile who brings steady grace to the front rows. Attentive and interactive, he values balance and thoughtful solutions. Practical, pleasant and approachable, he contributes calmly to discussion and builds rapport easily." },
    { name: "Abhishek Kumar Rai", rank: "Cdr", unit: "Logistics", birthday: "24 Apr", spouse_name: "Mrs Priya Bhadauria", spouse_birthday: "25 Dec", anniversary: "21 Nov", bio: "An EW specialist and gifted presenter who uses animation and humour to make technical material memorable. Abhishek pairs deep technical knowledge with engaging delivery and is also a strong basketball player. Friendly and collaborative, he lifts the mood in class and is always ready to assist colleagues." },
    { name: "Jyoti Sharma", rank: "Lt Col", unit: "ASC", birthday: "01 Apr", spouse_name: "Lt Col Anadi Jyoti Singh", spouse_birthday: "13 Aug", anniversary: "19 Aug", bio: "The division fitness icon and a favourite of many instructors, Jyoti runs long distances at sunrise and leads by example. Her discipline, cheerful demeanour and love of pets make her an inspiring role model. She motivates others to adopt healthier routines and approaches training with consistent determination." },
    { name: "Yankush Ahlawat", rank: "Lt Col", unit: "Infantry", birthday: "26 Jan", spouse_name: "Mrs Pushpa Ahlawat", spouse_birthday: "14 Feb", anniversary: "19 Nov", bio: "A man of few words and sharp precision, Yankush is a fit Para officer and the division trial officer. He shares practical insights with calm authority and is renowned for his crisp operational anecdotes. Disciplined, athletic and quietly commanding, he uses logic to cut through noise." },
    { name: "Dipin Duhan", rank: "Lt Col", unit: "Infantry", birthday: "11 Nov", spouse_name: "Mrs Rashmi Pundir", spouse_birthday: "19 Nov", anniversary: "11 Mar", bio: "Soft spoken and analytical, Dipin asks the clarifying questions that tidy up projects and discussions. He values accuracy, deep thinking and practical solutions. Fit and disciplined, he contributes calmly and reliably. His steady logic anchors group decisions and reassures peers with thoughtful perspective." },
    { name: "Shashank Sharma, SM", rank: "Lt Col", unit: "Infantry", birthday: "19 Mar", spouse_name: "Mrs Iram Khan", spouse_birthday: "30 Jun", anniversary: "27 Jan", bio: "A dignified infantry officer and Sena Medal recipient who leads through quiet example and firm integrity. Shashank blends humility with operational excellence and mentors juniors with patience. He maintains high standards and remains composed under pressure." },
    { name: "Nitish Dogra", rank: "Lt Col", unit: "Infantry", birthday: "11 Nov", spouse_name: "Mrs Shivani Dogra", spouse_birthday: "07 Mar", anniversary: "22 Jan", bio: "Affectionately compared to a film star, Nitish carries charm and composure with academic seriousness. He studies diligently while projecting an easy going first bench cool. Friendly, quietly competitive and reliable, he surprises peers with steady results." },
    { name: "Anurag Kanwar", rank: "Lt Col", unit: "Infantry", birthday: "19 Aug", spouse_name: "Mrs Neha Rathore", spouse_birthday: "10 Jul", anniversary: "22 Jan", bio: "Called the confused man in jest, Anurag is actually one of the most sincere and curious officers around and now an AI expert performing his research to the extreme professionalism. His questions reveal thoughtful routes to new understanding and he brings warm humility to every discussion." },
    { name: "Siddharth Bahadur", rank: "Lt Col", unit: "Infantry", birthday: "06 Dec", spouse_name: "Mrs Nisha Bahadur", spouse_birthday: "16 Apr", anniversary: "18 Feb", bio: "A cheerful dynamo who energises sports and study alike, Siddharth excels in basketball and badminton. Always visible and always smiling, he lifts morale and participates enthusiastically in activities. Curious, fit and sociable, he bridges academics and athletics with equal zeal." },
    { name: "Kamlesh Mani", rank: "Major", unit: "Mechanised Infantry", birthday: "23 Nov", spouse_name: "Mrs Priyanka Mani", spouse_birthday: "08 Jun", anniversary: "29 May", bio: "A smart and selective officer who invests energy where it matters most. Kamlesh prefers quiet family evenings and sings by night while delivering strong performance when called upon. Efficient, steady and unflappable, he quietly achieves results without fuss." },
    { name: "Nitish Kumar", rank: "Major", unit: "Mechanised Infantry", birthday: "05 Jun", spouse_name: "Mrs Vishakha Singh", spouse_birthday: "06 Dec", anniversary: "28 Jun", bio: "A whirlwind of conversation with a special interest in AI who keeps dialogue lively and insightful. Nitish blends witty commentary with serious curiosity and is never shy to share opinions. He recently authored and submitted an IEEE research paper and shares academic milestones with infectious pride." },
    { name: "Kartik Sharma", rank: "Major", unit: "Mechanised Infantry", birthday: "06 Oct", spouse_name: "Maj Harshita", spouse_birthday: "16 Nov", anniversary: "21 Apr", bio: "Kartik hails from the serene hills of Himachal Pradesh, and he carries that calm into every challenge. Disciplined both academically and physically, he scales problems with grace. An avid learner, he approaches every day as if it were a trek to the summit, steady, focused, and determined." },
    { name: "Sumit Sharma", rank: "Major", unit: "Infantry", birthday: "06 Oct", spouse_name: "Mrs Sandhya Sharma", spouse_birthday: "19 Nov", anniversary: "11 Nov", bio: "Recently promoted and encouraging, Sumit praises good work openly and motivates others through example. He is prepared, articulate and supportive, bringing clear thinking into class. Cheerful and practical, he lifts group morale and guides juniors positively. A mountaineering expert and a wonderful company to be around." },
    { name: "Gaurav Singh Rathour", rank: "Major", unit: "Infantry", birthday: "08 Aug", spouse_name: "Mrs Shivani Rathour", spouse_birthday: "11 Dec", anniversary: "05 Feb", bio: "An energetic infantry officer with a strong passion for basketball and sports. He enjoys life fully while maintaining professional competence in his domain. Friendly, approachable, and well-liked, he interacts easily with everyone and carries himself with confidence and warmth." },
    { name: "Deepak Tyagi", rank: "Major", unit: "Regiment of Artillery", birthday: "28 May", spouse_name: "Mrs Basu", spouse_birthday: "05 Jan", anniversary: "19 Nov", bio: "An LGSE qualified artillery officer who is alert and engaged in class and well respected for technical mastery. Deepak attempts jokes with cheerful persistence and maintains a respectful, warm demeanour. He balances family life, including twins, with professional rigor and is admired for steady competence." },
    { name: "Samarth A Naik", rank: "Major", unit: "Regiment of Artillery", birthday: "06 Aug", spouse_name: "Mrs Ankita", spouse_birthday: "05 Jun", anniversary: "23 Nov", bio: "A tall and bright artillery officer who combines academic strength with sporting ability. Samarth participates actively in class and on the field and lifts spirits with well timed humour. Family oriented and professional, he balances ambition with friendly approachability." },
    { name: "Kapil Kumar", rank: "Major", unit: "Regiment of Artillery", birthday: "20 Dec", spouse_name: "Mrs Preeti Singh", spouse_birthday: "31 Mar", anniversary: "11 May", bio: "A disciplined and methodical artillery officer who strongly believes in preparation and punctuality. Calm and focused by nature, he approaches academics and professional responsibilities with consistency and sincerity. A proper family man at heart, he balances service commitments with personal values seamlessly." },
    { name: "Janardhan Gaikwad", rank: "Lt Col", unit: "Corps of Engineers", birthday: "20 Jan", spouse_name: "Mrs Shital Gaikwad", spouse_birthday: "22 Sep", anniversary: "04 Dec", bio: "A high energy sapper known for initiative and tireless networking. Janardhan manages multiple groups smoothly and is always first to volunteer and organise. Charismatic and hands on, he gets things done and keeps activity momentum high across the cohort." },
    { name: "Harvinder Singh", rank: "Major", unit: "Corps of Engineers", birthday: "26 Nov", spouse_name: "Mrs Rupinder Kour", spouse_birthday: "28 May", anniversary: "08 Mar", bio: "A sincere and driven Engineer officer known for energy, discipline, and ownership. Happily married and deeply family-oriented, he values balance between duty and home. A keen sportsman, he actively participated in and organised major sporting and course events." },
    { name: "Siddhant Dogra", rank: "Major", unit: "Corps of Signals", birthday: "30 Aug", spouse_name: "Mrs Siddhant Dogra", spouse_birthday: "11 Jun", anniversary: "04 Feb", bio: "A sharp Signal officer who amusingly naps in class yet never misses a session. When he wakes he fires off precise core specific questions that sharpen debate. He always carries a novel and reads between lectures, pairing literary curiosity with technical acumen." },
    { name: "Ajay Kumar", rank: "Major", unit: "Army Aviation", birthday: "03 Nov", spouse_name: "Mrs Indu Sharma", spouse_birthday: "24 Oct", anniversary: "16 Jan", bio: "A serious intellectual who moved from Signals to Army Aviation and brings analytical precision to every discussion. Ajay balances long commutes and study with stoic discipline and delivers thoughtful contributions on emerging tech. Calm, cerebral and deeply professional." },
    { name: "Abhay Mukherjee", rank: "Major", unit: "Army Air Defence", birthday: "24 Jul", spouse_name: "Mrs Mandeep Kaur", spouse_birthday: "15 Aug", anniversary: "05 Mar", bio: "Known as the Missile Man for deep technical expertise in guided weaponry domains, Abhay prefers substance to limelight. He combines marathon discipline with curiosity for emerging technologies and travel. Quiet, intense and intellectually focused, he lets work and results speak for him." },
    { name: "Robin", rank: "Major", unit: "ASC", birthday: "04 Dec", spouse_name: "Mrs Hina Rohtaki", spouse_birthday: "11 Nov", anniversary: "26 Jun", bio: "A tall and focused ASC professional who prefers preparation to performance. Robin studies consistently and brings practical, methodical solutions to tasks. He balances family life with duty and approaches work with efficiency. Dependable, precise and quietly committed." },
    { name: "Sandip Yadav", rank: "Lt Col", unit: "Corps of EME", birthday: "26 Nov", spouse_name: "Dr Annu Yadav", spouse_birthday: "11 Oct", anniversary: "11 Nov", bio: "A calm, disciplined, and quietly efficient EME officer known for his consistency and composed demeanour. He is often among the first to arrive for classes, reflecting his methodical approach to duty. Soft spoken and steady, he contributes thoughtfully without drawing attention to himself. A devoted family man, he values balance in professional and personal life." },
    { name: "Santosh Teela", rank: "Wg Cdr", unit: "F(N)", birthday: "01 Jun", spouse_name: "Sqn Ldr Ashita Mathew", spouse_birthday: "05 Feb", anniversary: "17 Aug", bio: "A quiet, composed, and deeply sincere officer who believes in letting his work speak for itself. A Weapon Systems Officer by specialisation, he prefers function over fanfare and stays well away from the limelight. Rarely seen seeking attention, he is nevertheless respected and admired, especially by juniors, for his steady mentorship and calm guidance." },
    { name: "Dhann Singh", rank: "Wg Cdr", unit: "Administration", birthday: "28 Oct", spouse_name: "Mrs Neelam Kanwar", spouse_birthday: "13 Jan", anniversary: "22 Nov", bio: "A Mention in Despatches decorated officer, Dhann hides a sharp analytical mind behind a warm smile. He combines battlefield tempered judgment with cheerful approachability, greeting everyone with courtesy. His calm presence and clear insight make him a respected leader." },
    { name: "Sagar S Gaur", rank: "Sqn Ldr", unit: "F(P)", birthday: "08 Aug", spouse_name: "Mrs Gurleen Kaur", spouse_birthday: "25 Feb", anniversary: "11 Mar", bio: "An AWACS pilot who brings a sharp sense of humour and quick one liners to the classroom. Sagar asks incisive technical questions and keeps academic discussions lively. Married life and flying duties suit him well and he pairs technical curiosity with an easy going demeanour." },
    { name: "Praveen Kumar", rank: "Sqn Ldr", unit: "F(P)", birthday: "25 Jun", spouse_name: "Mrs Vibhuti Yadav", spouse_birthday: "03 Feb", anniversary: "06 Mar", bio: "A stylish and disciplined helicopter pilot admired for both looks and ability. Praveen is a gym enthusiast, skilled instructor and quietly kept the group united while spending much time at the Officers Mess. He combines operational experience with warm collegiality." },
    { name: "Brijesh Kumar Gupta", rank: "Sqn Ldr", unit: "AE (L)", birthday: "17 Aug", spouse_name: "Sqn Ldr Sugadha Kapoor", spouse_birthday: "09 Sep", anniversary: "20 Nov", bio: "The division technical master who explains complex concepts with calm clarity. Brijesh speaks selectively and his words always add sense and substance. Quiet, approachable and highly respected, he is the go to for technical mentoring and patient explanation." },
    { name: "Sagar Avijit Shukla", rank: "Sqn Ldr", unit: "AE (M)", birthday: "28 Oct", spouse_name: "Wg Cdr Anju", spouse_birthday: "05 Nov", anniversary: "02 Dec", bio: "Sagar is a cheerful and stylish officer who enjoys life to the fullest. Always well-dressed and often seen in shades, he is known for his lively humour. He loves interacting with people, cracking jokes, and keeping the atmosphere energetic and upbeat." },
    { name: "BMGS Somanatha", rank: "Major", unit: "Sri Lanka Army", birthday: "09 Jun", spouse_name: "Mrs Vishva Madubhani Fernando", spouse_birthday: "04 Dec", anniversary: "16 Sep", bio: "A quietly cheerful Sri Lankan officer who integrates seamlessly and offers gentle, observant support. Somanatha listens more than he speaks and is always ready to help peers in a polite and humble manner. He contributes international perspective and kind camaraderie to the course." },
    { name: "R Randeniya", rank: "Major", unit: "Sri Lanka Army", birthday: "22 Feb", spouse_name: "Mrs Chamini Weerakkody", spouse_birthday: "25 Mar", anniversary: "11 Jun", bio: "A social connector and festive spirit who keeps the course calendar lively. Randhya attends celebrations, birthdays and gatherings with boundless cheer and strengthens bonds across the cohort. Warm, well connected and convivial, he brings joy and enthusiasm to every event." },
    { name: "Sus Albert Sitinjak", rank: "Major", unit: "Indonesian Air Force", birthday: "23 Sep", spouse_name: "Mrs Dewi Sartika Simamora", spouse_birthday: "12 Jul", anniversary: "28 Apr", bio: "A grounded Indonesian officer known for evening walks, calm demeanour and cultural warmth. Albert is a devoted family man and a thoughtful conversationalist who balances duty with domestic life. Present in class and activities, he brings quiet wisdom and steady presence." },
    { name: "Herculano Henriques Nhamitambo Semo", rank: "Major", unit: "Mozambique Air Force", birthday: "24 Aug", spouse_name: "Mrs Joana", spouse_birthday: "24 Aug", anniversary: "24 Aug", bio: "A fit, polite and warm officer from Africa who greets everyone with genuine cheer. Herculano is disciplined in routine and often seen exercising near the sports complex. Jolly by nature and easy to approach, he bridges cultural gaps with courtesy and good humour." },
  ]),

  // ── PEREIRA DIVISION (ordered as per seniority) ──
  ...buildSO("Pereira", "per", [
    // Indian Officers
    ["Puja Jha", "Lt Col", "Intelligence Corps"],
    ["Gaurav Kukkar", "Wg Cdr", "AE (L)"],
    ["Pradeep Kumar", "Wg Cdr", "AE (L)"],
    ["Govind Singh", "Cdr", "Logistics"],
    ["Ramesh Muddapu", "Cdr", "Logistics"],
    ["Raghavendra Pratap Solanki", "Cdr", "Engineering"],
    ["Deepak Tomer", "Cdr", "Logistics"],
    ["Sanjay Kumar Sheorain", "Wg Cdr", "AE (M)"],
    ["Jithu Stanislaus", "Cdr", "Executive Branch"],
    ["Manish Yadav", "Major", "Army Air Defence"],
    ["Mahantesh Biradar", "Lt Col", "Armoured Corps"],
    ["Shashank Kapil", "Lt Col", "Infantry"],
    ["Pankaj Goutam", "Cdr", "Executive Branch"],
    ["Ankit Gaur", "Wg Cdr", "F(P)"],
    ["Himanshu Singh", "Wg Cdr", "AE (L)"],
    ["Deepak Sharma", "Lt Col", "Corps of Signals"],
    ["Piyush Chavan", "Lt Col", "Regiment of Artillery"],
    ["Dhairya Kumar", "Lt Col", "Infantry"],
    ["Ravindra Kumar", "Lt Col", "Corps of Engineers"],
    ["Trimohan", "Wg Cdr", "Logistics"],
    ["Simranjeet Singh Raina", "Major", "Infantry"],
    ["Gaurav Kher", "Major", "Infantry"],
    ["Yogendra Singh", "Major", "Regiment of Artillery"],
    ["Naman Sharma", "Major", "Infantry"],
    ["Manish Tripathi", "Sqn Ldr", "F(P)"],
    ["Ankit Chaudhary", "Major", "Army Ordnance Corps"],
    ["Ajinkya Arvind Powar", "Major", "Corps of Signals"],
    ["PR Kulkarni", "Sqn Ldr", "AE (M)"],
    ["Ravi Kumar Yadav", "Major", "Infantry"],
    ["Shibin S", "Major", "Mechanised Infantry"],
    ["Abhi Jain", "Major", "Mechanised Infantry"],
    ["Baibhav Ranjan", "Major", "Infantry"],
    ["Ravishankar Rajaram Kadam", "Major", "Regiment of Artillery"],
    ["Vikash", "Major", "Mechanised Infantry"],
    ["Vivek Chaudhary", "Major", "Regiment of Artillery"],
    ["Mukesh Kumar Gupta", "Major", "Corps of Engineers"],
    ["Dipak Singh", "Major", "Infantry"],
    ["Akash Gupta", "Major", "Corps of Engineers"],
    ["Yash Sharma", "Major", "Infantry"],
    // Foreign Officers
    ["SMT Priyadarshana", "Cdr", "Sri Lanka Navy"],
    ["TBVB Bandara", "Cdr", "Sri Lanka Navy"],
    ["Anwar Redhwan Bin Lokman Hakim", "Lt Cdr", "Royal Malaysian Navy"],
    ["Dickson Ayaa Afidra", "Major", "Uganda Air Force"],
    ["Emmanuel Byaruhanga", "Major", "Uganda Air Force"],
    ["Hassan Hussein", "Major", ""],
  ]),
];

// Personnel IDs whose photos have been removed (wrong/mismatched uploads)
// Includes all Pereira division except pers-per-6 (Raghavendra Pratap Solanki)
const noPhotoIds = new Set([
  // Staff officers
  "pers-2",      // Saurabh Bhargava
  "pers-so-2",   // G Mahesh Kumar
  "pers-so-3",   // Ramesh S Bhat
  "pers-so-5",   // Alok Tomer
  "pers-so-8",   // GM Tripathi
  "pers-so-9",   // V Lakhanpal
  "pers-so-10",  // Vishal Kapoor
  "pers-so-11",  // Robin Panicker
  "pers-so-12",  // Abhijeet Sawant
  "pers-so-13",  // Gagan Deep Dhaliwal
  "pers-so-14",  // Sumit Joshi
  "pers-so-15",  // RK Bhardwaj
  "pers-so-16",  // Suhrit Bhatia
  "pers-so-17",  // Nikhil Tomar
  "pers-so-18",  // Asif Sarkhawas
  "pers-so-20",  // Deepak Kashyap
  "pers-so-21",  // Sachin Tyagi
  "pers-so-22",  // Manish Sharma
  "pers-so-23",  // Pandurang M Nibandhe
  "pers-so-24",  // AS Virdi
  "pers-so-25",  // PM Abhyankar
  "pers-so-26",  // BP Tripathy
  "pers-so-27",  // Rachit Ahluwalia
  "pers-so-29",  // Rahul Inamdar
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
