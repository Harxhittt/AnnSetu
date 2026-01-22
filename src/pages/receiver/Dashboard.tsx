import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Package, MapPin, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, Donation } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { IssueForm } from '../../components/IssueForm';

export const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [availableFood, setAvailableFood] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [dropOTP, setDropOTP] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Donation | null>(null);

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  const fetchAvailableFood = async () => {
    setLoading(true);
    try {
      const data = await api.getAvailableFood();
      setAvailableFood(data);
    } catch (error) {
      console.error('Error fetching available food:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFood = async (donationId: string) => {
    setRequesting(donationId);
    try {
      const result = await api.requestFood(donationId, user?.id || '');
      setDropOTP(result.dropOTP);
      const food = availableFood.find((f) => f.id === donationId);
      setSelectedFood(food || null);
      addToast('Food requested successfully!', 'success');
    } catch (error) {
      addToast('Request failed. Please try again.', 'error');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1>Receiver Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Browse and request available food donations
              </p>
            </div>
            <Button onClick={() => setShowIssueForm(true)} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Food Quality Issue
            </Button>
          </div>

          {/* Available Food Listings */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading available food...</p>
                </CardContent>
              </Card>
            ) : availableFood.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3>No food available</h3>
                  <p className="text-muted-foreground mt-2">
                    Check back later for new food donations
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFood.map((food) => (
                  <Card key={food.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{food.foodType}</CardTitle>
                            <CardDescription>Quantity: {food.quantity}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={food.status === 'pending' ? 'default' : 'secondary'}
                        >
                          {food.status === 'pending' ? 'Available' : 'Assigned'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Expires in: {food.expiryTime}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {food.pickupLocation}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRequestFood(food.id)}
                        disabled={requesting === food.id || food.status !== 'pending'}
                        className="w-full"
                      >
                        {requesting === food.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Requesting...
                          </>
                        ) : food.status === 'pending' ? (
                          'Request Food'
                        ) : (
                          'Already Assigned'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Drop OTP Dialog */}
          <Dialog open={!!dropOTP} onOpenChange={() => setDropOTP(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your Drop OTP</DialogTitle>
                <DialogDescription>
                  Share this OTP with the volunteer during delivery
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2">Request Confirmed!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Food: {selectedFood?.foodType}
                </p>
                <p className="text-sm text-muted-foreground mb-4">Drop OTP</p>
                <div className="text-4xl font-mono tracking-widest bg-secondary py-4 px-6 rounded-lg inline-block">
                  {dropOTP}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  The volunteer will need this OTP to confirm delivery
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    📱 A volunteer will be assigned shortly to deliver your food
                  </p>
                </div>
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
