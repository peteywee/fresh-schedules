import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Activity } from '@/lib/types';

const activities: Activity[] = [
  {
    id: '1',
    user: { name: 'Olivia Martin', avatar: PlaceHolderImages[0] },
    action: 'published a new schedule for',
    target: 'Week of Oct 23',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: { name: 'Jackson Lee', avatar: PlaceHolderImages[1] },
    action: 'approved a time-off request for',
    target: 'Ava Smith',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    user: { name: 'AI Assistant', avatar: PlaceHolderImages[4] },
    action: 'generated a new labor plan for',
    target: 'Q4 2024',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    user: { name: 'Isabella Nguyen', avatar: PlaceHolderImages[2] },
    action: 'clocked in for',
    target: 'Cashier shift',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    user: { name: 'William Kim', avatar: PlaceHolderImages[3] },
    action: 'updated organization details',
    target: '',
    timestamp: '2 days ago',
  },
];

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of recent activities in your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar.imageUrl} alt="Avatar" data-ai-hint={activity.user.avatar.imageHint} />
                <AvatarFallback>
                  {activity.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  <span className="font-semibold">{activity.user.name}</span>{' '}
                  {activity.action}{' '}
                  {activity.target && <span className="font-semibold">{activity.target}</span>}
                </p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
