import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectProgress {
  subject: string;
  hours: number;
  percentage: number;
  color: string;
}

interface ProgressTrackerWidgetProps {
  totalHours: number;
  completion: number;
  subjects: SubjectProgress[];
  suggestedFocus?: {
    subject: string;
    topic: string;
    reason: string;
  };
}

export default function ProgressTrackerWidget({ 
  totalHours, 
  completion, 
  subjects, 
  suggestedFocus 
}: ProgressTrackerWidgetProps) {
  const [timeframe, setTimeframe] = useState("week");

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex flex-row items-center justify-between">
        <CardTitle className="font-display font-semibold text-lg">Weekly Progress</CardTitle>
        <div className="flex space-x-2">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="text-sm border border-neutral-200 rounded h-8 px-2 py-1 w-[100px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="lastWeek">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Study Time</p>
            <p className="text-2xl font-display font-bold">
              {totalHours} <span className="text-sm text-neutral-500 font-normal">hrs</span>
            </p>
          </div>
          <div className="h-16 w-16 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path 
                className="stroke-current text-neutral-200" 
                strokeWidth="3" 
                fill="none" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path 
                className="stroke-current text-secondary" 
                strokeWidth="3" 
                fill="none" 
                strokeLinecap="round" 
                strokeDasharray={`${completion}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              {completion}%
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{subject.subject}</span>
                <span className="text-neutral-500">{subject.hours} hrs</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2">
                <div 
                  className={`${subject.color} h-2 rounded-full`} 
                  style={{ width: `${subject.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {suggestedFocus && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Suggested Focus Areas</h3>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex">
                <span className="material-icons text-warning mr-2">tips_and_updates</span>
                <div>
                  <p className="text-sm font-medium">{suggestedFocus.subject} - {suggestedFocus.topic}</p>
                  <p className="text-xs text-neutral-600 mt-1">{suggestedFocus.reason}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
