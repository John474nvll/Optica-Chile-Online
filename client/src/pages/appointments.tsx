import { useAppointments, useCreateAppointment } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const { data: appointments } = useAppointments({ patientId: user?.id });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Appointments</h1>
          <p className="text-muted-foreground">Manage your clinic visits.</p>
        </div>
        <BookAppointmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} selectedDate={date} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <Card className="border-border/50 shadow-sm">
             <CardHeader>
              <CardTitle>Calendar</CardTitle>
             </CardHeader>
             <CardContent>
               <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
              />
             </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8 space-y-4">
          <h2 className="text-xl font-bold font-display mb-4">Scheduled Visits</h2>
          {!appointments?.length ? (
            <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
              No appointments found.
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="p-6 bg-white rounded-2xl border border-border/50 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase">
                       {apt.status}
                     </span>
                     <span className="text-sm text-muted-foreground">
                       ID: #{apt.id}
                     </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{format(new Date(apt.date), "EEEE, MMMM do, yyyy")}</h3>
                  <p className="text-slate-500 mt-1">Time: {format(new Date(apt.date), "h:mm a")}</p>
                </div>
                <div className="text-right sm:self-center">
                  <p className="font-medium text-slate-700">{apt.reason || "Checkup"}</p>
                  <p className="text-sm text-slate-400">{apt.doctorName ? `Dr. ${apt.doctorName}` : "Doctor TBD"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function BookAppointmentDialog({ open, onOpenChange, selectedDate }: { open: boolean, onOpenChange: (v: boolean) => void, selectedDate?: Date }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate, isPending } = useCreateAppointment();
  const [reason, setReason] = useState("");
  const [time, setTime] = useState("09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate) return;

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes);

    mutate({
      patientId: user.id,
      date: appointmentDate.toISOString(), // Send as ISO string
      reason: reason,
      status: "scheduled"
    }, {
      onSuccess: () => {
        toast({ title: "Appointment Requested", description: "We will confirm your slot shortly." });
        onOpenChange(false);
        setReason("");
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Book Visit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="p-3 border rounded-md bg-slate-50 text-slate-600">
              {selectedDate ? format(selectedDate, "PPP") : "Select a date on the calendar"}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Reason for Visit</Label>
            <Textarea 
              placeholder="e.g., Routine checkup, Vision blurry..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
            />
          </div>

          <Button type="submit" className="w-full bg-primary" disabled={isPending || !selectedDate}>
            {isPending ? "Scheduling..." : "Confirm Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
