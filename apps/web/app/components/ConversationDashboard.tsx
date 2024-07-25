'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell } from 'recharts';
import { Menu, X, MessageSquare, Filter } from 'lucide-react';
import { Button } from "@repo/ui/src/button";
import { Checkbox } from "@repo/ui/src/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/src/dialog";
import { DateRange } from "react-day-picker";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Conversation {
  id: number;
  title: string;
  messages: { text: string; isUser: boolean }[];
  category: string;
  date: string;
}

interface ConversationDashboardProps {
  timeSeriesData: { date: string; count: number }[];
  categoryData: { name: string; value: number }[];
  conversations: Conversation[];
  children?: React.ReactNode;
}


const ConversationDashboard: React.FC<ConversationDashboardProps> = ({ timeSeriesData, categoryData, conversations, children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedConversations, setSelectedConversations] = useState<Conversation[]>([]);
  const [generatedChat, setGeneratedChat] = useState<string>('');

  const filteredConversations = conversations.filter(conv => 
    (conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategories.length === 0 || selectedCategories.includes(conv.category)) &&
    (!dateRange?.from || new Date(conv.date) >= dateRange.from) &&
    (!dateRange?.to || new Date(conv.date) <= dateRange.to)
  );

  const categories = Array.from(new Set(conversations.map(conv => conv.category)));

  const generateChat = async () => {
    // In a real application, you would call an API to generate the chat
    // For this example, we'll just concatenate the selected conversations
    const chatContent = selectedConversations.map(conv => 
      `Title: ${conv.title}\nCategory: ${conv.category}\nDate: ${conv.date}\n\n` +
      conv.messages.map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`).join('\n')
    ).join('\n\n');

    setGeneratedChat(chatContent);
    setSelectedConversation(null); // Clear the selected conversation to show the generated chat
  };

  return (
    <div className="w-full h-screen flex relative">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden z-10 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="p-4">
          <button
            className="absolute top-4 right-4 text-gray-800 dark:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
            {filteredConversations.map(conv => (
              <div 
                key={conv.id} 
                className="p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Checkbox
                  checked={selectedConversations.some(c => c.id === conv.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedConversations(prev => [...prev, conv]);
                    } else {
                      setSelectedConversations(prev => prev.filter(c => c.id !== conv.id));
                    }
                  }}
                  className="mr-2"
                />
                <div onClick={() => setSelectedConversation(conv)}>
                  <h4 className="font-semibold">{conv.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{conv.category} - {conv.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Main content */}
      <div className={`w-full h-full flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button
              className="text-gray-800 dark:text-white mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <MessageSquare className="w-6 h-6 mr-2" />
            <span className="font-semibold">Conversation Analysis</span>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Conversations</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Categories</h4>
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedCategories(prev => [...prev, category]);
                            } else {
                              setSelectedCategories(prev => prev.filter(c => c !== category));
                            }
                          }}
                        />
                        <label>{category}</label>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Date Range</h4>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={generateChat}>
              Generate Chat
            </Button>
            {children}
          </div>
        </div>
        {/* Dashboard content */}
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Conversation Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {selectedConversation && (
            <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">{selectedConversation.title}</h3>
              <div className="space-y-2">
                {selectedConversation.messages.map((message, index) => (
                  <div key={index} className={`p-2 rounded ${message.isUser ? 'bg-blue-100 dark:bg-blue-900 ml-auto' : 'bg-gray-100 dark:bg-gray-800'} max-w-[70%]`}>
                    {message.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedChat && !selectedConversation && (
            <div className="border border-gray-300 dark:border-gray-700 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-2">Generated Chat</h3>
              <pre className="whitespace-pre-wrap">{generatedChat}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationDashboard;