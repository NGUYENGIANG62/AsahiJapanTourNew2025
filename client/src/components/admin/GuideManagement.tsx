import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Guide } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Languages, 
  FilterX,
  Filter,
  Award,
  BadgeCheck,
  Users
} from 'lucide-react';

// Form schema
const guideSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  pricePerDay: z.coerce.number().min(1, 'Price must be at least 1'),
  experience: z.coerce.number().min(0, 'Experience cannot be negative').optional(),
  hasInternationalLicense: z.boolean().optional(),
  personality: z.string().optional(),
  gender: z.string().optional(),
  age: z.coerce.number().min(18, 'Age must be at least 18 years').max(100, 'Age must be realistic').optional(),
});

type GuideFormValues = z.infer<typeof guideSchema>;

const GuideManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Filter states
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null);
  const [filterExperience, setFilterExperience] = useState<number | null>(null);
  const [filterLicense, setFilterLicense] = useState<boolean | null>(null);
  
  // Available languages for guides
  const availableLanguages = [
    { id: 'english', label: t('languages.en') },
    { id: 'japanese', label: t('languages.ja') },
    { id: 'chinese', label: t('languages.zh') },
    { id: 'korean', label: t('languages.ko') },
    { id: 'vietnamese', label: t('languages.vi') },
  ];
  
  // Get all guides
  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });
  
  // Filter guides by search term and other filters
  const filteredGuides = guides.filter(guide => {
    // Search by name
    if (!guide.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by language
    if (filterLanguage && !guide.languages.includes(filterLanguage)) {
      return false;
    }
    
    // Filter by experience (if defined)
    if (filterExperience !== null && guide.experience) {
      if (guide.experience < filterExperience) {
        return false;
      }
    }
    
    // Filter by license
    if (filterLicense !== null && guide.hasInternationalLicense !== filterLicense) {
      return false;
    }
    
    return true;
  });

  // Form
  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      name: '',
      languages: ['english'],
      pricePerDay: 0,
      experience: undefined,
      hasInternationalLicense: false,
      personality: '',
      gender: '',
      age: undefined,
    },
  });
  
  // Create guide mutation
  const createGuideMutation = useMutation({
    mutationFn: async (values: GuideFormValues) => {
      const response = await apiRequest('POST', '/api/guides', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide created successfully',
      });
      setIsFormDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create guide',
        variant: 'destructive',
      });
    },
  });
  
  // Update guide mutation
  const updateGuideMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: GuideFormValues }) => {
      const response = await apiRequest('PUT', `/api/guides/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide updated successfully',
      });
      setIsFormDialogOpen(false);
      setSelectedGuide(null);
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update guide',
        variant: 'destructive',
      });
    },
  });
  
  // Delete guide mutation
  const deleteGuideMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/guides/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete guide',
        variant: 'destructive',
      });
    },
  });
  
  // Reset all filters
  const resetFilters = () => {
    setFilterLanguage(null);
    setFilterExperience(null);
    setFilterLicense(null);
    setSearchTerm('');
  };
  
  // Handle form submission
  const onSubmit = (values: GuideFormValues) => {
    if (selectedGuide) {
      updateGuideMutation.mutate({ id: selectedGuide.id, values });
    } else {
      createGuideMutation.mutate(values);
    }
  };
  
  // Handle edit guide
  const handleEditGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    form.reset({
      name: guide.name,
      languages: guide.languages,
      pricePerDay: guide.pricePerDay,
      experience: guide.experience,
      hasInternationalLicense: guide.hasInternationalLicense || false,
      personality: guide.personality || '',
      gender: guide.gender || '',
      age: guide.age,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle delete guide
  const handleDeleteGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add new guide
  const handleAddGuide = () => {
    setSelectedGuide(null);
    form.reset({
      name: '',
      languages: ['english'],
      pricePerDay: 0,
      experience: undefined,
      hasInternationalLicense: false,
      personality: '',
      gender: '',
      age: undefined,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedGuide) {
      deleteGuideMutation.mutate(selectedGuide.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('admin.guideManagement')}</CardTitle>
          <Button onClick={handleAddGuide}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.addNewGuide')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-wrap justify-between gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`${t('common.search')} ${t('admin.guideManagement').toLowerCase()}...`}
                className="pl-10 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filterLanguage || 'all'}
                onValueChange={(value) => setFilterLanguage(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Languages className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All languages</SelectItem>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filterExperience?.toString() || 'any'}
                onValueChange={(value) => setFilterExperience(value === 'any' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <Award className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Min experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any experience</SelectItem>
                  <SelectItem value="1">1+ year</SelectItem>
                  <SelectItem value="3">3+ years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filterLicense !== null ? filterLicense.toString() : 'any'}
                onValueChange={(value) => {
                  if (value === 'any') setFilterLicense(null);
                  else setFilterLicense(value === 'true');
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Int'l license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any license type</SelectItem>
                  <SelectItem value="true">Has int'l license</SelectItem>
                  <SelectItem value="false">No int'l license</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" onClick={resetFilters}>
                <FilterX className="h-4 w-4 mr-2" />
                Reset filters
              </Button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.guideName')}</TableHead>
                <TableHead>{t('admin.languages')}</TableHead>
                <TableHead className="hidden md:table-cell">Experience</TableHead>
                <TableHead className="hidden md:table-cell">License</TableHead>
                <TableHead>{t('admin.pricePerDay')} (JPY)</TableHead>
                <TableHead className="hidden lg:table-cell">Details</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredGuides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No guides found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell>{guide.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang === 'english' ? t('languages.en') : 
                             lang === 'japanese' ? t('languages.ja') :
                             lang === 'chinese' ? t('languages.zh') :
                             lang === 'korean' ? t('languages.ko') :
                             lang === 'vietnamese' ? t('languages.vi') : lang}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guide.experience ? `${guide.experience} years` : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {guide.hasInternationalLicense ? 
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-200">International</Badge> : 
                        <Badge variant="outline" className="text-xs">Standard</Badge>
                      }
                    </TableCell>
                    <TableCell>{guide.pricePerDay.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-xs text-muted-foreground">
                        {guide.gender && <span className="mr-2">{guide.gender}</span>}
                        {guide.age && <span className="mr-2">{guide.age} years old</span>}
                        {guide.personality && <span>{guide.personality}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGuide(guide)}>
                          <Edit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGuide(guide)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add/Edit Guide Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGuide ? t('common.edit') : t('common.add')} {t('admin.guideManagement')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.guideName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Tanaka Yuki" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">{t('admin.languages')}</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableLanguages.map((language) => (
                          <FormItem
                            key={language.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={form.watch('languages').includes(language.id)}
                                onCheckedChange={(checked) => {
                                  const currentLanguages = form.getValues('languages');
                                  if (checked) {
                                    form.setValue('languages', [...currentLanguages, language.id]);
                                  } else {
                                    form.setValue(
                                      'languages',
                                      currentLanguages.filter((lang) => lang !== language.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {language.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pricePerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.pricePerDay')} (JPY)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Tabs defaultValue="qualifications" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                    <TabsTrigger value="personal">Personal Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="qualifications" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="50"
                              placeholder="e.g. 5" 
                              {...field}
                              value={field.value === undefined ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value !== '' ? Number(e.target.value) : undefined;
                                field.onChange(value);
                              }} 
                            />
                          </FormControl>
                          <FormDescription>
                            Number of years working as a tour guide
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasInternationalLicense"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              International Tour Guide License
                            </FormLabel>
                            <FormDescription>
                              Guide has certification for international tour groups
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="18" 
                              max="100"
                              placeholder="e.g. 35" 
                              {...field}
                              value={field.value === undefined ? '' : field.value}
                              onChange={(e) => {
                                const value = e.target.value !== '' ? Number(e.target.value) : undefined;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="personality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personality Traits</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Friendly, Patient, Energetic" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe the guide's personality traits and style
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsFormDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createGuideMutation.isPending || updateGuideMutation.isPending}
                  >
                    {createGuideMutation.isPending || updateGuideMutation.isPending
                      ? t('common.loading')
                      : selectedGuide 
                        ? t('common.save')
                        : t('common.add')
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.delete')} {t('admin.guideManagement')}</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the guide "{selectedGuide?.name}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteGuideMutation.isPending}
              >
                {deleteGuideMutation.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GuideManagement;