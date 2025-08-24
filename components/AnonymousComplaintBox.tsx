'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert } from 'lucide-react';
import { submitComplaint } from '@/lib/ai/flows/submitComplaint';
import { useToast } from '@/hooks/use-toast';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AnonymousComplaintBoxProps {
  setDialogOpen: (open: boolean) => void;
}

export default function AnonymousComplaintBox({ setDialogOpen }: AnonymousComplaintBoxProps) {
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitComplaint = async () => {
    if (!complaint) return;
    setLoading(true);

    try {
      const result = await submitComplaint({ complaint });
      if (result.success) {
        setComplaint('');
        toast({
            title: "Submission Successful",
            description: result.message,
        });
        setDialogOpen(false); // Close dialog on success
      } else {
        toast({
            title: "Submission Failed",
            description: "We couldn't submit your complaint at this time. Please try again later.",
            variant: "destructive",
        })
      }
    } catch (e) {
      console.error('Error submitting complaint:', e);
      toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again later.",
            variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>Anonymous Complaint Box</DialogTitle>
                <DialogDescription>
                  Your feedback is confidential and helps us improve.
                </DialogDescription>
              </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder="Share your concerns about clubs, events, or anything else..."
            disabled={loading}
            rows={5}
          />
          <Button onClick={handleSubmitComplaint} disabled={loading || !complaint} className="w-full">
            {loading ? 'Submitting...' : 'Submit Anonymously'}
          </Button>
        </div>
      </DialogContent>
  );
}
