import { Metadata } from 'next';
import { Button } from "@repo/ui/src/button";
import { sql } from "drizzle-orm";
import { getThemeToggler } from "./lib/get-theme-button";
import { auth, signIn, signOut } from "./server/auth";
import { db } from "./server/db";
import { users } from "./server/db/schema";
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

const ConversationDashboard = dynamic(() => import('./components/ConversationDashboard'), { ssr: false });

export const runtime = "edge";

export const metadata: Metadata = {
  title: 'Conversation Dashboard',
  description: 'Analytics and management for user conversations',
};

// TypeScript interfaces for our data structures
interface TimeSeriesData {
  date: string;
  count: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface Conversation {
  id: number;
  title: string;
  messages: { text: string; isUser: boolean }[];
  category: string;
  date: string;
}

export default async function Page() {
  try {
    const usr = await auth();
    const userCount = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(users);

    const SetThemeButton = getThemeToggler();

    // Mock data for conversation analysis
    const timeSeriesData: TimeSeriesData[] = [
      { date: '2024-07-20', count: 5 },
      { date: '2024-07-21', count: 7 },
      { date: '2024-07-22', count: 3 },
      { date: '2024-07-23', count: 8 },
    ];

    const categoryData: CategoryData[] = [
      { name: 'IT Support', value: 10 },
      { name: 'Sales', value: 5 },
      { name: 'General', value: 3 },
      { name: 'HR', value: 2 },
    ];

    const conversations: Conversation[] = [
      {
        id: 1,
        title: "Password Reset Issue",
        messages: [
          { text: "How do I reset my password?", isUser: true },
          { text: "To reset your password, please follow these steps:\n1. Go to the login page\n2. Click on 'Forgot Password'\n3. Enter your email address\n4. Follow the instructions sent to your email", isUser: false }
        ],
        category: "IT Support",
        date: "2024-07-20"
      },
      // ... other conversations ...
    ];

    return (
      <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <ConversationDashboard
          timeSeriesData={timeSeriesData}
          categoryData={categoryData}
          conversations={conversations}
        >
          <div className="flex items-center space-x-4">
            <SetThemeButton />
            {usr?.user?.email ? (
              <div className="flex items-center space-x-4">
                <span>{usr.user.name}</span>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <Button variant="outline" size="sm">Sign out</Button>
                </form>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <Button variant="outline" size="sm">Login with Google</Button>
              </form>
            )}
          </div>
        </ConversationDashboard>
        <div className="p-4 text-center">
          <span>Number of users in database: {userCount[0]?.count ?? 'N/A'}</span>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    notFound();
  }
}