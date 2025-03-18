import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, Users, UserCog, Shield } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

// Password change schema
const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Schema for other user password management
const otherUserPasswordSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

type OtherUserPasswordFormValues = z.infer<typeof otherUserPasswordSchema>;

const UserManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserPasswordDialogOpen, setIsUserPasswordDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  
  // Form for admin's own password
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Form for other users' passwords
  const userPasswordForm = useForm<OtherUserPasswordFormValues>({
    resolver: zodResolver(otherUserPasswordSchema),
    defaultValues: {
      username: '',
      newPassword: '',
    },
  });
  
  // Fetch system users (excluding admin)
  const { data: systemUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });
  
  // Admin password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const response = await apiRequest('PUT', '/api/admin/password', { newPassword });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('admin.passwordChanged'),
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });
  
  // Other user password change mutation
  const userPasswordChangeMutation = useMutation({
    mutationFn: async (data: OtherUserPasswordFormValues) => {
      const response = await apiRequest('PUT', '/api/admin/user-password', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('admin.userPasswordChanged'),
      });
      setIsUserPasswordDialogOpen(false);
      userPasswordForm.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to change user password',
        variant: 'destructive',
      });
    },
  });
  
  // Handle admin password change form submission
  const onSubmit = (values: PasswordFormValues) => {
    passwordChangeMutation.mutate(values.newPassword);
  };
  
  // Handle other user password change form submission
  const onUserPasswordSubmit = (values: OtherUserPasswordFormValues) => {
    userPasswordChangeMutation.mutate(values);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t('admin.userManagement')}</CardTitle>
        <CardDescription>Quản lý tài khoản hệ thống và phân quyền người dùng</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="admin" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Tài khoản Admin</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Tài khoản người dùng</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="admin" className="space-y-6 mt-6">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Thông tin tài khoản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('admin.changePassword')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Thay đổi mật khẩu cho tài khoản admin. Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa và một số.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="mt-2"
              >
                <LockKeyhole className="mr-2 h-4 w-4" />
                Thay đổi mật khẩu
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Quản lý tài khoản người dùng</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Thay đổi mật khẩu cho tài khoản khách hàng hoặc đại lý. Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa và một số.
              </p>
              <Button 
                onClick={() => setIsUserPasswordDialogOpen(true)}
                className="mt-2"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Đổi mật khẩu người dùng
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Admin Password Change Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thay đổi mật khẩu admin</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit"
                    disabled={passwordChangeMutation.isPending}
                  >
                    {passwordChangeMutation.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* User Password Change Dialog */}
        <Dialog open={isUserPasswordDialogOpen} onOpenChange={setIsUserPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thay đổi mật khẩu người dùng</DialogTitle>
            </DialogHeader>
            
            <Form {...userPasswordForm}>
              <form onSubmit={userPasswordForm.handleSubmit(onUserPasswordSubmit)} className="space-y-4">
                <FormField
                  control={userPasswordForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tài khoản người dùng</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tài khoản người dùng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Khách hàng (customer)</SelectItem>
                          <SelectItem value="AsahiLKNamA">Đại lý Nam A (AsahiLKNamA)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsUserPasswordDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit"
                    disabled={userPasswordChangeMutation.isPending}
                  >
                    {userPasswordChangeMutation.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
