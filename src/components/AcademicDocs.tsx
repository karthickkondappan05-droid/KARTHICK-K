import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Home, Lightbulb, Target, Settings, Database, Code, CheckCircle, Info, Zap } from 'lucide-react';

export default function AcademicDocs() {
  return (
    <div className="space-y-12 pb-20">
      <Section title="1. Problem Statement" icon={<Info className="w-6 h-6" />}>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            In the modern urban landscape, finding a suitable rental house is an increasingly complex task. Users are often overwhelmed by fragmented information across multiple platforms, inconsistent property descriptions, and a lack of personalized guidance.
          </p>
          <div className="pl-4 border-l-4 border-primary/20 bg-muted/30 p-4 rounded-r-lg">
            <h4 className="font-semibold text-foreground mb-2">Key Challenges:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Information Overload: Sorting through thousands of irrelevant listings.</li>
              <li>Subjective Needs: Difficulty matching amenities with lifestyle preferences.</li>
              <li>Manual Filtering: Time-consuming manual search processes.</li>
              <li>Cold Start: New users finding it hard to get quality suggestions immediately.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="2. Objectives" icon={<Target className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ObjectiveCard 
            title="Personalization" 
            desc="Leverage user profiles to tailor search results to individual budgets and location needs."
            icon={<Zap className="w-5 h-5 text-orange-500" />}
          />
          <ObjectiveCard 
            title="Efficiency" 
            desc="Reduce the 'Time-to-Match' by using recommendation algorithms that prioritize high-relevance listings."
            icon={<Settings className="w-5 h-5 text-blue-500" />}
          />
          <ObjectiveCard 
            title="Unified Experience" 
            desc="Provide a seamless interface for discovering, filtering, and saving favorite properties."
            icon={<Home className="w-5 h-5 text-green-500" />}
          />
        </div>
      </Section>

      <Section title="3. System Design" icon={<Settings className="w-6 h-6" />}>
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-2xl font-mono text-sm border border-slate-800">
            <h4 className="text-slate-400 mb-4 uppercase tracking-widest text-[10px]">Data Flow Diagram</h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="px-4 py-2 bg-blue-600 rounded">User Input (Prefs)</div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="px-4 py-2 bg-purple-600 rounded">Recommendation Engine (Scoring Logic)</div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="flex space-x-8">
                <div className="px-4 py-2 bg-emerald-700 rounded border border-emerald-500">Firestore (Listing DB)</div>
                <div className="px-4 py-2 bg-amber-700 rounded border border-amber-500">User History/Favs</div>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="px-4 py-2 bg-blue-600 rounded">Ranked List (Output)</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Technology Stack</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React + Vite</Badge>
                <Badge variant="outline">Firebase Auth</Badge>
                <Badge variant="outline">Cloud Firestore</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">TypeScript</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Dataset Schema</h4>
              <div className="text-[10px] bg-slate-50 p-2 rounded border font-mono">
                {`Listing {
  id: string,
  title: string,
  price: number,
  location: string,
  bhk: number,
  amenities: string[],
  imageUrl: string
}`}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="4. Implementation Details" icon={<Database className="w-6 h-6" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The core logic is implemented in the <code className="bg-muted px-1">recommendationEngine</code> which maps user preferences to a normalized 0-100 score.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-slate-100">
               <CardHeader className="py-3">
                 <CardTitle className="text-sm">User Input Handling</CardTitle>
               </CardHeader>
               <CardContent className="text-xs text-muted-foreground">
                 State-driven controlled components capture budget, BHK, and location parameters in real-time.
               </CardContent>
             </Card>
             <Card className="border-slate-100">
               <CardHeader className="py-3">
                 <CardTitle className="text-sm">Persistence</CardTitle>
               </CardHeader>
               <CardContent className="text-xs text-muted-foreground">
                 Firestore handles the synchronization of user "Favorites" and rental listings with transactional safety.
               </CardContent>
             </Card>
          </div>
        </div>
      </Section>

      <Section title="5. Recommendation Algorithm" icon={<Code className="w-6 h-6" />}>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            The system employs a <strong>Content-Based Filtering</strong> approach, specifically utilizing a weighted scoring model based on attribute proximity.
          </p>
          <Card className="bg-muted/50 border-none">
            <CardContent className="pt-6">
              <h5 className="font-semibold mb-2">Scoring Equation:</h5>
              <div className="font-serif italic text-xl text-center py-4 bg-background/50 rounded-lg mb-4">
                Score = (W<sub>L</sub> × Match<sub>Loc</sub>) + (W<sub>P</sub> × InverseDelta<sub>Price</sub>) + (W<sub>B</sub> × Match<sub>BHK</sub>) + (W<sub>A</sub> × Density<sub>Amnt</sub>)
              </div>
              <p className="text-sm text-muted-foreground">
                Where W represents weights: Location (0.4), Price (0.3), BHK (0.2), Amenities (0.1).
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="6. Advantages & Limitations" icon={<CheckCircle className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-green-600 font-semibold flex items-center gap-2"><Zap className="w-4 h-4"/> Advantages</h4>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>Low Latency: Real-time scoring using client-side logic.</li>
              <li>Tailored Results: Adapts dynamically to preference changes.</li>
              <li>Centralized: Firestore serves as a scalable single source of truth.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-red-600 font-semibold flex items-center gap-2"><Lightbulb className="w-4 h-4"/> Limitations</h4>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>Cold Start: Recommendation quality depends on user data input.</li>
              <li>Attribute Dependency: Accuracy is limited by the quality of property tags.</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
      <Separator />
    </div>
  );
}

function ObjectiveCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-slate-50 border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}
