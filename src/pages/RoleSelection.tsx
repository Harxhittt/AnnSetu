import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Package, Truck, Warehouse, HandHeart, Loader2 } from 'lucide-react';
import { useToast, ToastContainer } from '../components/Toast';

interface RoleOption {
  role: UserRole;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectRole } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);

  const roles: RoleOption[] = [
    {
      role: 'admin',
      icon: <Users className="h-8 w-8" />,
      title: 'Admin',
      description: 'Manage platform, users, and monitor activities',
    },
    {
      role: 'donor',
      icon: <Package className="h-8 w-8" />,
      title: 'Donor',
      description: 'Donate surplus food to help the community',
    },
    {
      role: 'volunteer',
      icon: <Truck className="h-8 w-8" />,
      title: 'Volunteer',
      description: 'Deliver food from donors to receivers',
    },
    {
      role: 'warehouse',
      icon: <Warehouse className="h-8 w-8" />,
      title: 'Warehouse Manager',
      description: 'Manage food inventory and distribution',
    },
    {
      role: 'receiver',
      icon: <HandHeart className="h-8 w-8" />,
      title: 'Receiver',
      description: 'Request and receive donated food',
    },
  ];

  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await selectRole(selectedRole);
      addToast('Role selected successfully!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      addToast('Failed to select role. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍚</span>
            </div>
            <h1>Select Your Role</h1>
            <p className="text-muted-foreground mt-2">
              Choose how you'd like to contribute to AnnSetu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {roles.map((roleOption) => (
              <Card
                key={roleOption.role}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRole === roleOption.role
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
                onClick={() => setSelectedRole(roleOption.role)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    selectedRole === roleOption.role ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}>
                    {roleOption.icon}
                  </div>
                  <CardTitle>{roleOption.title}</CardTitle>
                  <CardDescription>{roleOption.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleRoleSelect}
              disabled={!selectedRole || loading}
              size="lg"
              className="min-w-64"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
