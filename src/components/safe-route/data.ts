// Seed content for the Safe Route demo. Mirrors the shipped app's mock data (alerts, campaigns, feed, chats,
// emergency resources); everything here is sample data and lives in memory only.

export type Post = {
  id: string;
  type: string;
  text: string;
  place: string;
  minsAgo: number; // minutes before the demo opened
  likes: number;
  dislikes: number;
  comments: { id: string; text: string }[];
  mine?: boolean;
};

export type Campaign = { id: string; title: string; blurb: string; people: number; about: string; does: string[]; meets: string };

export type Chat = { id: string; name: string; initials: string; online: boolean; unread: number; status: string; where: string; msgs: { me: boolean; text: string }[] };

export const CRIME_TYPES = ["Theft", "Assault", "Burglary", "Vandalism", "Harassment", "Other"] as const;

export const ALERTS = [
  { id: "a1", type: "Theft", place: "Downtown Austin", when: "2 hours ago", level: "medium", text: "Bike stolen from bike rack" },
  { id: "a2", type: "Harassment", place: "East Austin", when: "4 hours ago", level: "high", text: "Suspicious person following pedestrians" },
  { id: "a3", type: "Vandalism", place: "West Campus", when: "6 hours ago", level: "low", text: "Graffiti reported on building" },
] as const;

export const RESOURCES = [
  { id: "r1", title: "Emergency services", blurb: "Police, fire, ambulance", number: "911" },
  { id: "r2", title: "Mental health crisis", blurb: "24/7 crisis support", number: "988" },
  { id: "r3", title: "Poison control", blurb: "24/7 poison information", number: "1-800-222-1222" },
  { id: "r4", title: "Domestic violence", blurb: "National hotline", number: "1-800-799-7233" },
] as const;

export const CAMPAIGNS: Campaign[] = [
  { id: "c1", title: "Neighborhood Watch", blurb: "Join the Sunset Valley watch program", people: 42, about: "Neighbors look out for each other, share alerts, and report anything unusual to the right people.", does: ["Share local alerts", "Meet monthly", "Report suspicious activity"], meets: "1st Monday, 7:00 PM" },
  { id: "c2", title: "Streetlight Initiative", blurb: "Help improve lighting in your area", people: 28, about: "Dark blocks feel and are less safe. Volunteers log dim or broken lights and follow them up with the city.", does: ["Report broken lights", "Coordinate city fixes", "Promote well-lit streets"], meets: "2nd Thursday, 6:30 PM" },
  { id: "c3", title: "Hazard Reporting", blurb: "Report and track neighborhood hazards", people: 15, about: "Potholes, blocked sidewalks, broken crossings. Track them until they're fixed.", does: ["Photograph hazards", "File city tickets", "Track progress"], meets: "Online, ongoing" },
  { id: "c4", title: "Community Patrol", blurb: "Volunteer for safety patrols", people: 35, about: "Visible, friendly walking patrols on busy evenings and event nights.", does: ["Walk in pairs", "Stay visible", "Call it in, don't intervene"], meets: "Fri and Sat, 8:00 PM" },
  { id: "c5", title: "Emergency Preparedness", blurb: "First aid and emergency response", people: 22, about: "Short sessions on first aid, evacuation plans, and what to keep in a go-bag.", does: ["First aid basics", "Build a plan", "Check on neighbors"], meets: "Last Saturday, 10:00 AM" },
  { id: "c6", title: "Youth Safety Program", blurb: "Safety education for kids and teens", people: 18, about: "Age-appropriate sessions on staying safe online, walking home, and asking for help.", does: ["Run workshops", "Mentor teens", "Partner with schools"], meets: "Wednesdays, 4:00 PM" },
];

export const FEED: Post[] = [
  { id: "p1", type: "Theft", text: "Bike stolen from the rack near the library. Black mountain bike with red handlebars.", place: "University Library", minsAgo: 120, likes: 12, dislikes: 2, comments: [{ id: "1", text: "Saw someone suspicious around there around 3 PM." }, { id: "2", text: "Check the security cameras." }] },
  { id: "p2", type: "Vandalism", text: "Graffiti on the side of the coffee shop. Red spray paint tags.", place: "Downtown coffee shop", minsAgo: 240, likes: 8, dislikes: 1, comments: [{ id: "1", text: "This is getting out of hand." }] },
  { id: "p3", type: "Harassment", text: "Someone followed me while I was walking home from work. Made me feel unsafe.", place: "7th and Chicon", minsAgo: 360, likes: 15, dislikes: 0, comments: [{ id: "1", text: "Stay safe. Share your route with a buddy next time." }] },
  { id: "p4", type: "Assault", text: "Fight broke out at a bar. Multiple people involved, police were called.", place: "6th Street", minsAgo: 480, likes: 5, dislikes: 3, comments: [] },
  { id: "p5", type: "Burglary", text: "Car broken into in the parking garage. Window smashed, laptop stolen.", place: "Downtown garage", minsAgo: 720, likes: 20, dislikes: 1, comments: [{ id: "1", text: "Same thing happened to me last week." }, { id: "2", text: "This area needs better lighting." }] },
];

export const CHATS: Chat[] = [
  { id: "m1", name: "Sarah Johnson", initials: "SJ", online: true, unread: 2, status: "Walking home from campus", where: "West Campus", msgs: [{ me: false, text: "Heading out of the library now" }, { me: false, text: "Can you check my route?" }] },
  { id: "m2", name: "Michael Chen", initials: "MC", online: false, unread: 0, status: "Last seen 2h ago", where: "East Austin", msgs: [{ me: false, text: "Thanks for the heads up earlier" }] },
  { id: "m3", name: "Emily Rodriguez", initials: "ER", online: true, unread: 1, status: "On the 5 bus", where: "Downtown", msgs: [{ me: false, text: "Are you free for the patrol Friday?" }] },
  { id: "m4", name: "David Park", initials: "DP", online: false, unread: 0, status: "Last seen yesterday", where: "South Congress", msgs: [] },
];

export const REPLIES = ["Got it, thanks.", "Sounds good. I'll text when I'm there.", "Good call. Take the lit route.", "On it.", "I'll keep an eye out."];

export const ago = (m: number) => (m < 1 ? "Just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`);
