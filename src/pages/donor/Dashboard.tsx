import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Package, Clock, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, Donation } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, ToastContainer } from '../../components/Toast';
import { IssueForm } from '../../components/IssueForm';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    expiryTime: '',
    pickupLocation: '',
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await api.getDonations(user?.id);
      setDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newDonation = await api.createDonation({
        ...formData,
        donorId: user?.id || '',
      });
      setDonations([newDonation, ...donations]);
      setShowDonationForm(false);
      setFormData({ foodType: '', quantity: '', expiryTime: '', pickupLocation: '' });
      addToast('Donation created successfully!', 'success');
    } catch (error) {
      addToast('Failed to create donation. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: Donation['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
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
              <h1>Donor Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage your food donations and help reduce waste
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button onClick={() => setShowIssueForm(true)} variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Raise Issue
              </Button>
              <Button onClick={() => setShowDonationForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Donate Food
              </Button>
            </div>
          </div>

          {/* Donations List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading donations...</p>
                </CardContent>
              </Card>
            ) : donations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3>No donations yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Click "Donate Food" to create your first donation
                  </p>
                </CardContent>
              </Card>
            ) : (
              donations.map((donation) => (
                <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1">{donation.foodType}</h3>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {donation.quantity}
                            </p>
                          </div>
                          <Badge className={getStatusColor(donation.status)}>
                            {donation.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Expires in: {donation.expiryTime}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {donation.pickupLocation}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {(donation.status === 'pending' || donation.status === 'assigned') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDonation(donation)}
                          >
                            View Pickup OTP
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Donation Form Dialog */}
          <Dialog open={showDonationForm} onOpenChange={setShowDonationForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Donate Food</DialogTitle>
                <DialogDescription>
                  Fill in the details about the food you want to donate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type</Label>
                  <Input
                    id="foodType"
                    placeholder="e.g., Rice & Curry, Sandwiches, Fresh Vegetables"
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 50 plates, 20 kg"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryTime">Expiry Time</Label>
                  <Input
                    id="expiryTime"
                    placeholder="e.g., 6 hours, 2 days"
                    value={formData.expiryTime}
                    onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Textarea
                    id="pickupLocation"
                    placeholder="Enter complete pickup address"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Donation'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDonationForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Pickup OTP Dialog */}
          <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pickup OTP</DialogTitle>
                <DialogDescription>
                  Share this OTP with the volunteer during pickup
                </DialogDescription>
              </DialogHeader>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Pickup OTP</p>
                <div className="text-4xl font-mono tracking-widest bg-secondary py-4 px-6 rounded-lg inline-block">
                  {selectedDonation?.pickupOTP}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  The volunteer will need this OTP to confirm pickup
                </p>
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
