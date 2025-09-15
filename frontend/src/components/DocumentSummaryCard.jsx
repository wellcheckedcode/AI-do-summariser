import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DocumentSummaryCard = ({ title, summary, updatedAt, onOpen }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-snug">{title}</CardTitle>
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




