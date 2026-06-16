import React, { useState } from 'react';
import ClassesView from './ClassesView';
import SubjectsView from './SubjectsView';
import SchedulesView from './SchedulesView';
import ImportCenterView from './ImportCenterView';
import { 
  Layers, 
  BookOpen, 
  Calendar, 
  Database,
  Sparkles
} from 'lucide-react';

interface AcademicViewProps {
  currentUser: any;
  initialSubTab?: 'classrooms' | 'subjects' | 'schedules' | 'import-center';
}

type SubTab = 'classrooms' | 'subjects' | 'schedules' | 'import-center';

export default function AcademicView({ currentUser, initialSubTab = 'classrooms' }: AcademicViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab);

  const renderActiveSubView = () => {
    switch (activeSubTab) {
      case 'classrooms':
        return <ClassesView currentUser={currentUser} />;
      case 'subjects':
        return <SubjectsView currentUser={currentUser} />;
      case 'schedules':
        return <SchedulesView currentUser={currentUser} />;
      case 'import-center':
        return <ImportCenterView currentUser={currentUser} />;
      default:
        return <ClassesView currentUser={currentUser} />;
    }
  };

  const tabsConfig = [
    { id: 'classrooms', label: 'الفصول والتقسيمات الشعبية', icon: Layers, roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs'] },
    { id: 'subjects', label: 'توزيع المقررات والمناهج', icon: BookOpen, roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] },
    { id: 'schedules', label: 'جدول الحصص والتوزيع الأسبوعي', icon: Calendar, roles: ['admin', 'supervisor', 'director', 'vice_director', 'student_affairs', 'teacher'] },
    { id: 'import-center', label: 'مركز الاستيراد والدمج الذكي (Excel)', icon: Database, roles: ['admin', 'director', 'vice_director', 'student_affairs'] }
  ];

  const visibleTabs = tabsConfig.filter(tab => tab.roles.includes(currentUser.role));

  return (
    <div className="space-y-6" id="academic-affairs-hub">
      
      {/* Tab Navigation header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as SubTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-150 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-left max-md:hidden">
            <span className="text-[10px] text-slate-400 font-bold block">مجمع مدرسة منارة اليمن</span>
            <span className="text-[11px] text-primary font-black mt-0.5 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              الحوكمة المدرسية الأكاديمية
            </span>
          </div>

        </div>
      </div>

      {/* Embedded view Canvas */}
      <div className="transition-all duration-205">
        {renderActiveSubView()}
      </div>

    </div>
  );
}
