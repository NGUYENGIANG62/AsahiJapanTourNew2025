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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  LockKeyhole, 
  Users, 
  UserCog, 
  Shield, 
  UserPlus, 
  Pencil, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

// User type definition
type User = {
  id: number;
  username: string;
  role: 'admin' | 'user' | 'agent';
  agencyId?: string | null;
  dataSource?: string | null;
};

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

// New user creation schema
const userCreationSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  role: z.enum(['user', 'agent']),
  agencyId: z.string().nullable().optional(),
  dataSource: z.string().nullable().optional(),
});

type UserCreationFormValues = z.infer<typeof userCreationSchema>;

// User edit schema
const userEditSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  role: z.enum(['user', 'agent']),
  agencyId: z.string().nullable().optional(),
  dataSource: z.string().nullable().optional(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const UserManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserPasswordDialogOpen, setIsUserPasswordDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
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
  
  // Form for creating new users
  const createUserForm = useForm<UserCreationFormValues>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'user',
      agencyId: null,
      dataSource: null,
    },
  });
  
  // Form for editing existing users
  const editUserForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: '',
      role: 'user',
      agencyId: null,
      dataSource: null,
    },
  });
  
  // Fetch system users (excluding admin)
  const { data: systemUsers, isLoading: loadingUsers, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
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
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserCreationFormValues) => {
      const response = await apiRequest('POST', '/api/admin/users', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tài khoản đã được tạo thành công',
      });
      setIsCreateUserDialogOpen(false);
      createUserForm.reset();
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UserEditFormValues }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tài khoản đã được cập nhật thành công',
      });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tài khoản đã được xóa thành công',
      });
      setIsDeleteUserDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete user',
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
  
  // Handle create user form submission
  const onCreateUserSubmit = (values: UserCreationFormValues) => {
    createUserMutation.mutate(values);
  };
  
  // Handle edit user form submission
  const onEditUserSubmit = (values: UserEditFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data: values });
    }
  };
  
  // Handle delete user
  const onDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };
  
  // Handle edit user button click
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({
      username: user.username,
      role: user.role === 'admin' ? 'user' : user.role, // Don't allow changing to admin
      agencyId: user.agencyId || null,
      dataSource: user.dataSource || null,
    });
    setIsEditUserDialogOpen(true);
  };
  
  // Handle delete user button click
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Quản lý tài khoản người dùng</h3>
              <Button 
                onClick={() => {
                  createUserForm.reset({
                    username: '',
                    password: '',
                    role: 'user',
                    agencyId: null,
                    dataSource: null,
                  });
                  setIsCreateUserDialogOpen(true);
                }}
                className="ml-auto"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Tạo tài khoản mới
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Danh sách tài khoản</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchUsers()}
                  >
                    Làm mới
                  </Button>
                </div>
                
                {loadingUsers ? (
                  <div className="py-4 text-center">Đang tải dữ liệu...</div>
                ) : systemUsers && systemUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead>Mã đại lý</TableHead>
                          <TableHead>Nguồn dữ liệu</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>
                              {user.role === 'admin' ? 'Quản trị viên' : 
                               user.role === 'agent' ? 'Đại lý' : 'Khách hàng'}
                            </TableCell>
                            <TableCell>{user.agencyId || '-'}</TableCell>
                            <TableCell>
                              {user.dataSource ? (
                                <span className="truncate max-w-[200px] inline-block">
                                  {user.dataSource.substring(0, 25)}...
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Không có tài khoản người dùng nào.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Đổi mật khẩu người dùng</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Thay đổi mật khẩu cho tài khoản khách hàng hoặc đại lý. Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa và một số.
              </p>
              <Button 
                onClick={() => setIsUserPasswordDialogOpen(true)}
                className="mt-2"
              >
                <LockKeyhole className="mr-2 h-4 w-4" />
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
                          {systemUsers?.map((user) => (
                            <SelectItem key={user.id} value={user.username}>
                              {user.username} ({user.role === 'agent' ? 'Đại lý' : 'Khách hàng'})
                            </SelectItem>
                          ))}
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
        
        {/* Create User Dialog */}
        <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản mới</DialogTitle>
              <DialogDescription>
                Tạo tài khoản mới cho khách hàng hoặc đại lý với các quyền truy cập phù hợp.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createUserForm}>
              <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
                <FormField
                  control={createUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Khách hàng</SelectItem>
                          <SelectItem value="agent">Đại lý</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {createUserForm.watch("role") === "agent" && (
                  <>
                    <FormField
                      control={createUserForm.control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã đại lý</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createUserForm.control}
                      name="dataSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Google Sheet</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                              placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateUserDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin tài khoản cho {selectedUser?.username}.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...editUserForm}>
              <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4">
                <FormField
                  control={editUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Khách hàng</SelectItem>
                          <SelectItem value="agent">Đại lý</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {editUserForm.watch("role") === "agent" && (
                  <>
                    <FormField
                      control={editUserForm.control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã đại lý</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editUserForm.control}
                      name="dataSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Google Sheet</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                              placeholder="https://docs.google.com/spreadsheets/d/..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditUserDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete User Dialog */}
        <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Xác nhận xóa tài khoản
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.username}</strong>? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDeleteUser}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Đang xử lý...' : 'Xóa tài khoản'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
