import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MapPin, Package, Loader2, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { api, DeliveryTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { OTPInput } from '../../components/OTPInput';
import { IssueForm } from '../../components/IssueForm';

type OTPType = 'pickup' | 'drop';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DeliveryTask | null>(null);
  const [otpType, setOtpType] = useState<OTPType | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getDeliveryTasks(user?.id || '');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!selectedTask) return;

    setVerifying(true);
    try {
      let success = false;
      if (otpType === 'pickup') {
        success = await api.verifyPickupOTP(selectedTask.id, otp);
      } else {
        success = await api.verifyDropOTP(selectedTask.id, otp);
      }

      if (success) {
        addToast(
          `${otpType === 'pickup' ? 'Pickup' : 'Drop'} verified successfully!`,
          'success'
        );
        setOtpType(null);
        setSelectedTask(null);
        fetchTasks();
      } else {
        addToast('Invalid OTP. Please try again.', 'error');
      }
    } catch (error) {
      addToast('Verification failed. Please try again.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const openOTPDialog = (task: DeliveryTask, type: OTPType) => {
    setSelectedTask(task);
    setOtpType(type);
  };

  const getStatusColor = (status: DeliveryTask['status']) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1>Volunteer Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Your assigned pickup and delivery tasks
              </p>
            </div>
            <Button onClick={() => setShowIssueForm(true)} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Raise Issue
            </Button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading tasks...</p>
                </CardContent>
              </Card>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3>No active tasks</h3>
                  <p className="text-muted-foreground mt-2">
                    New delivery tasks will appear here when assigned
                  </p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{task.foodDetails}</CardTitle>
                        <CardDescription>Task ID: #{task.id}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Map Placeholder */}
                    <div className="bg-secondary rounded-lg p-8 text-center">
                      <Navigation className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Map integration placeholder
                      </p>
                      <Button variant="link" size="sm" className="mt-2">
                        Open in Google Maps
                      </Button>
                    </div>

                    {/* Locations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">Pickup Location</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                          {task.pickupLocation}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium">Drop Location</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-10">
                          {task.dropLocation}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {task.status === 'assigned' && (
                        <Button
                          onClick={() => openOTPDialog(task, 'pickup')}
                          className="flex-1"
                        >
                          Enter Pickup OTP
                        </Button>
                      )}
                      {task.status === 'picked_up' && (
                        <Button
                          onClick={() => openOTPDialog(task, 'drop')}
                          className="flex-1"
                        >
                          Enter Drop OTP
                        </Button>
                      )}
                      {task.status === 'delivered' && (
                        <div className="flex-1 flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Delivery Completed</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* OTP Verification Dialog */}
          <Dialog open={!!otpType} onOpenChange={() => setOtpType(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {otpType === 'pickup' ? 'Pickup' : 'Drop'} Verification
                </DialogTitle>
                <DialogDescription>
                  Enter the {otpType === 'pickup' ? '4-digit OTP from the donor' : '4-digit OTP from the receiver'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <OTPInput onComplete={handleVerifyOTP} disabled={verifying} />
                {verifying && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Issue Form Dialog */}
          <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
            <DialogContent className="max-w-2xl">
              <IssueForm
                onSuccess={() => {
                  setShowIssueForm(false);
                  addToast('Issue reported successfully!', 'success');
                }}
                onCancel={() => setShowIssueForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </>
  );
};
