// frontend/src/components/DocumentSummaryCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DocumentSummaryCard = ({ title, summary, updatedAt, onOpen, priority, action_required }) => {
  const getPriorityVariant = () => {
    if (priority === 'High') return 'destructive';
    if (priority === 'Medium') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base leading-snug">{title}</CardTitle>
          <Badge variant={getPriorityVariant()}>{priority}</Badge>
        </div>
        <p className="text-xs text-muted-foreground pt-1">{action_required}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{summary}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated {updatedAt}</span>
          <Button size="sm" variant="secondary" onClick={onOpen}>Open</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSummaryCard;