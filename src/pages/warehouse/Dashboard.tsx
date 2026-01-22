import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Package, Loader2, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { api, FoodInventory } from '../../services/api';
import { useToast, ToastContainer } from '../../components/Toast';
import { IssueForm } from '../../components/IssueForm';

export const WarehouseDashboard: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [inventory, setInventory] = useState<FoodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: FoodInventory['status']) => {
    setActionLoading(id);
    try {
      await api.updateInventoryStatus(id, status);
      setInventory(
        inventory.map((item) => (item.id === id ? { ...item, status } : item))
      );
      addToast(`Food ${status} successfully!`, 'success');
    } catch (error) {
      addToast('Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: FoodInventory['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      dispatched: 'bg-blue-100 text-blue-800',
    };
    return colors[status];
  };

  const stats = {
    totalItems: inventory.length,
    pending: inventory.filter((i) => i.status === 'pending').length,
    accepted: inventory.filter((i) => i.status === 'accepted').length,
    dispatched: inventory.filter((i) => i.status === 'dispatched').length,
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1>Warehouse Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage food inventory and distribution
              </p>
            </div>
            <Button onClick={() => setShowIssueForm(true)} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Storage Issue
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.accepted}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dispatched</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.dispatched}</div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Food Inventory</CardTitle>
              <CardDescription>
                Review incoming food and manage storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading inventory...</p>
                </div>
              ) : inventory.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3>No inventory items</h3>
                  <p className="text-muted-foreground mt-2">
                    Food items will appear here when received
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Food Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Received At</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.foodType}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.source}
                          </TableCell>
                          <TableCell>
                            {new Date(item.receivedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item.expiryTime}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {item.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(item.id, 'accepted')
                                    }
                                    disabled={actionLoading === item.id}
                                  >
                                    {actionLoading === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleUpdateStatus(item.id, 'rejected')
                                    }
                                    disabled={actionLoading === item.id}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {item.status === 'accepted' && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateStatus(item.id, 'dispatched')
                                  }
                                  disabled={actionLoading === item.id}
                                >
                                  {actionLoading === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                  )}
                                  Dispatch
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

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
