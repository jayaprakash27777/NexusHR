const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/User/.gemini/antigravity-ide/scratch/NexusHR/frontend/src/pages/dashboard';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Dashboard.tsx') && f !== 'AdminDashboard.tsx' && f !== 'EmployeeDashboard.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already added
  if (content.includes('AnnouncementsWidget')) continue;

  // Add import
  content = content.replace(
    "import PageTransition from '@/components/animation/PageTransition'",
    "import PageTransition from '@/components/animation/PageTransition'\nimport AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'"
  );

  // Add component before </PageTransition>
  const widgetHtml = `
      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>
    </PageTransition>`;
    
  content = content.replace(/<\/PageTransition>\s*$/m, widgetHtml);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
