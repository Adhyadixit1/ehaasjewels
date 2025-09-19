import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Package, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { ProductService } from '@/services/ProductService';
import AdminService from '@/services/AdminService';
import { supabase } from '@/integrations/supabase/client';

interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  isPrimary?: boolean;
  type: 'image' | 'video';
}

interface VariantOption {
  id?: number;
  name: string;
  displayName: string;
  values: { id?: number; value: string; displayValue: string }[];
}

interface ProductVariant {
  id?: number;
  name: string;
  price: number;
  stockQuantity: number;
  optionValues: { optionName: string; value: string }[];
  // Added for image selection
  selectedImageIds: number[];
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  category: string;
  subcategory: string;
  sku: string;
  weight: string;
  dimensions: string;
  material: string;
  gemstone: string;
  purity: string;
  occasion: string;
  gender: string;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  stockQuantity: number;
  minStockLevel: number;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  careInstructions: string;
  warranty: string;
  images: UploadedMedia[];
  // New variant fields
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: ProductVariant[];
  // Optional music fields for reels
  enableMusic?: boolean;
  musicFile?: File | null;
  musicTitle?: string;
  musicArtist?: string;
  musicStartAtSeconds?: number;
  musicEndAtSeconds?: number | null;
  musicPriority?: number;
  musicIsActive?: boolean;
}

const categories = [
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Pendants',
  'Bangles',
  'Chains',
  'Anklets'
];

const materials = [
  'Gold',
  'Silver',
  'Platinum',
  'Rose Gold',
  'White Gold',
  'Stainless Steel'
];

const gemstones = [
  'Diamond',
  'Ruby',
  'Emerald',
  'Sapphire',
  'Pearl',
  'Amethyst',
  'Topaz',
  'Garnet',
  'None'
];

export default function AdminProductAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    category: '',
    subcategory: '',
    sku: '',
    weight: '',
    dimensions: '',
    material: '',
    gemstone: '',
    purity: '',
    occasion: '',
    gender: '',
    isActive: true,
    isFeatured: false,
    isSponsored: false,
    stockQuantity: 0,
    minStockLevel: 5,
    tags: '',
    metaTitle: '',
    metaDescription: '',
    careInstructions: '',
    warranty: '',
    images: [],
    // New variant fields
    hasVariants: false,
    variantOptions: [],
    variants: [] // This should be fine as it's an empty array of ProductVariant[]
    ,
    // Music defaults (optional)
    enableMusic: false,
    musicFile: null,
    musicTitle: '',
    musicArtist: '',
    musicStartAtSeconds: 0,
    musicEndAtSeconds: null,
    musicPriority: 100,
    musicIsActive: true
  });

  // Load product data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadProductData(id);
    }
  }, [id]);

  const loadProductData = async (productId: string) => {
    try {
      setIsLoading(true);
      const product = await ProductService.getProductById(productId);
      
      // Map product data to form data
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        comparePrice: product.sale_price || 0,
        category: product.categories?.name || '',
        subcategory: '',
        sku: product.sku,
        weight: product.weight?.toString() || '',
        dimensions: '',
        material: product.material || '',
        gemstone: '',
        purity: '',
        occasion: '',
        gender: '',
        isActive: product.is_active,
        isFeatured: product.featured,
        isSponsored: false,
        stockQuantity: product.stock_quantity,
        minStockLevel: product.min_stock_level || 5,
        tags: '',
        metaTitle: '',
        metaDescription: '',
        careInstructions: '',
        warranty: '',
        images: product.product_images?.map(img => ({
          id: img.id?.toString() || '',
          url: img.image_url,
          publicId: img.cloudinary_public_id || '',
          originalName: img.alt_text || '',
          size: 0,
          isPrimary: img.is_primary || false,
          type: (img.media_type === 'video' ? 'video' : 'image') as 'image' | 'video'
        })) || [],
        // Variant fields (to be loaded separately)
        hasVariants: false,
        variantOptions: [],
        variants: []
      });

      // Load variant data if exists
      try {
        const variantOptions = await ProductService.getProductVariantOptions(parseInt(productId));
        const variants = await ProductService.getProductVariants(parseInt(productId));
        
        if (variantOptions.length > 0 || variants.length > 0) {
          let mappedOptions = [];
          if (variantOptions.length > 0) {
            mappedOptions = variantOptions.map(option => ({
              id: option.id,
              name: option.name,
              displayName: option.displayName,
              values: option.values.map(value => ({
                id: value.id,
                value: value.value,
                displayValue: value.displayValue
              }))
            }));
          }

          setFormData(prev => ({
            ...prev,
            hasVariants: true,
            variantOptions: mappedOptions
          }));
          
          // Load variants
          if (variants.length > 0) {
            const mappedVariants = variants.map(variant => ({
              id: variant.id,
              name: variant.name,
              price: variant.price,
              stockQuantity: variant.stockQuantity,
              optionValues: variant.options.map(option => ({
                optionName: option.optionName,
                value: option.value
              })),
              selectedImageIds: variant.selectedImageIds || []
            }));
            
            setFormData(prev => ({
              ...prev,
              hasVariants: true,
              variants: mappedVariants
            }));
          }
        }
      } catch (variantError) {
        console.warn('No variants found for this product');
        // Ensure hasVariants is false if no variants exist
        setFormData(prev => ({
          ...prev,
          hasVariants: false
        }));
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Error Loading Product',
        description: error instanceof Error ? error.message : 'Failed to load product data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagesChange = (images: UploadedMedia[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  const handleVariantOptionChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newOptions = [...prev.variantOptions];
      if (field === 'name' || field === 'displayName') {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
      return { ...prev, variantOptions: newOptions };
    });
  };

  const handleVariantOptionValueChange = (optionIndex: number, valueIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const newOptions = [...prev.variantOptions];
      const newValues = [...newOptions[optionIndex].values];
      newValues[valueIndex] = { ...newValues[valueIndex], [field]: value };
      newOptions[optionIndex] = { ...newOptions[optionIndex], values: newValues };
      return { ...prev, variantOptions: newOptions };
    });
  };

  const addVariantOption = () => {
    setFormData(prev => ({
      ...prev,
      variantOptions: [
        ...prev.variantOptions,
        { name: '', displayName: '', values: [{ value: '', displayValue: '' }] }
      ]
    }));
  };

  const removeVariantOption = (index: number) => {
    setFormData(prev => {
      const newOptions = [...prev.variantOptions];
      newOptions.splice(index, 1);
      return { ...prev, variantOptions: newOptions };
    });
  };

  const addVariantOptionValue = (optionIndex: number) => {
    setFormData(prev => {
      const newOptions = [...prev.variantOptions];
      newOptions[optionIndex].values.push({ value: '', displayValue: '' });
      return { ...prev, variantOptions: newOptions };
    });
  };

  const removeVariantOptionValue = (optionIndex: number, valueIndex: number) => {
    setFormData(prev => {
      const newOptions = [...prev.variantOptions];
      newOptions[optionIndex].values.splice(valueIndex, 1);
      return { ...prev, variantOptions: newOptions };
    });
  };

  const generateVariants = () => {
    // Generate all possible combinations of variant options
    if (formData.variantOptions.length === 0) return;

    // Create base product variant (first variant) with a customizable name
    const baseVariant: ProductVariant = {
      name: formData.name || "Base Product", // Use product name as default or "Base Product"
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      optionValues: [],
      selectedImageIds: [] // Initially no images selected
    };

    const combinations: ProductVariant[] = [baseVariant];
    
    // Helper function to generate combinations for additional variants
    const generateCombinations = (options: VariantOption[], prefix: { optionName: string; value: string }[] = []) => {
      if (options.length === 0) {
        combinations.push({
          name: prefix.map(p => p.value).join(' / '),
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          optionValues: [...prefix],
          selectedImageIds: [] // Initially no images selected
        });
        return;
      }
      
      const [first, ...rest] = options;
      for (const value of first.values) {
        generateCombinations(rest, [...prefix, { optionName: first.name, value: value.value }]);
      }
    };
    
    generateCombinations(formData.variantOptions);
    
    setFormData(prev => ({
      ...prev,
      variants: combinations
    }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      if (field === 'name' || field === 'price' || field === 'stockQuantity') {
        newVariants[index] = { ...newVariants[index], [field]: value };
      }
      return { ...prev, variants: newVariants };
    });
  };

  // New function to handle image selection for variants
  const handleVariantImageSelection = (variantIndex: number, imageId: number, isSelected: boolean) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const selectedImageIds = [...newVariants[variantIndex].selectedImageIds];
      
      console.log(`Variant ${variantIndex} image selection:`, { imageId, isSelected, currentSelection: selectedImageIds });
      
      if (isSelected) {
        // Add image ID to selected images only if it's a valid number and not already selected
        if (imageId && !selectedImageIds.includes(imageId)) {
          selectedImageIds.push(imageId);
        }
      } else {
        // Remove image ID from selected images
        const index = selectedImageIds.indexOf(imageId);
        if (index > -1) {
          selectedImageIds.splice(index, 1);
        }
      }
      
      newVariants[variantIndex] = { ...newVariants[variantIndex], selectedImageIds };
      
      console.log(`Updated variant ${variantIndex} selected images:`, selectedImageIds);
      
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantOptionValueChangeInVariant = (variantIndex: number, optionName: string, value: string) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const optionValues = [...newVariants[variantIndex].optionValues];
      const optionIndex = optionValues.findIndex(ov => ov.optionName === optionName);
      
      if (optionIndex >= 0) {
        optionValues[optionIndex] = { optionName, value };
      } else {
        optionValues.push({ optionName, value });
      }
      
      newVariants[variantIndex] = { ...newVariants[variantIndex], optionValues };
      return { ...prev, variants: newVariants };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product description is required',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Product price must be greater than 0',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Product category is required',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.images.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one product media (image or video) is required',
        variant: 'destructive',
      });
      return false;
    }

    // Validate variants if enabled
    if (formData.hasVariants) {
      if (formData.variantOptions.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one variant option is required',
          variant: 'destructive',
        });
        return false;
      }

      for (const option of formData.variantOptions) {
        if (!option.name.trim()) {
          toast({
            title: 'Validation Error',
            description: 'All variant options must have a name',
            variant: 'destructive',
          });
          return false;
        }
        if (!option.displayName.trim()) {
          toast({
            title: 'Validation Error',
            description: 'All variant options must have a display name',
            variant: 'destructive',
          });
          return false;
        }
        if (option.values.length === 0) {
          toast({
            title: 'Validation Error',
            description: 'Each variant option must have at least one value',
            variant: 'destructive',
          });
          return false;
        }
        for (const value of option.values) {
          if (!value.value.trim()) {
            toast({
              title: 'Validation Error',
              description: 'All variant values must have a value',
              variant: 'destructive',
            });
            return false;
          }
          if (!value.displayValue.trim()) {
            toast({
              title: 'Validation Error',
              description: 'All variant values must have a display value',
              variant: 'destructive',
            });
            return false;
          }
        }
      }

      if (formData.variants.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Variants must be generated after defining options',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate SKU if not provided
      if (!formData.sku) {
        formData.sku = ProductService.generateSKU(formData.category);
      }

      // Prepare product data for database
      const productData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.description.substring(0, 200),
        price: formData.price,
        comparePrice: formData.comparePrice > 0 ? formData.comparePrice : undefined,
        category: formData.category,
        sku: formData.sku,
        weight: formData.weight,
        material: formData.material,
        brand: 'एहसास Jewellery',
        stockQuantity: formData.stockQuantity,
        minStockLevel: formData.minStockLevel,
        featured: formData.isFeatured,
        isActive: formData.isActive
      };

      // Prepare specifications if any
      const specifications = [];
      if (formData.material) {
        specifications.push({ specName: 'Material', specValue: formData.material });
      }
      if (formData.weight) {
        specifications.push({ specName: 'Weight', specValue: formData.weight });
      }
      if (formData.dimensions) {
        specifications.push({ specName: 'Dimensions', specValue: formData.dimensions });
      }
      if (formData.gemstone) {
        specifications.push({ specName: 'Gemstone', specValue: formData.gemstone });
      }
      if (formData.purity) {
        specifications.push({ specName: 'Purity', specValue: formData.purity });
      }
      if (formData.occasion) {
        specifications.push({ specName: 'Occasion', specValue: formData.occasion });
      }
      if (formData.gender) {
        specifications.push({ specName: 'Gender', specValue: formData.gender });
      }

      let savedProduct;
      if (isEditMode && id) {
        // Update existing product
        savedProduct = await ProductService.updateProduct(
          parseInt(id),
          productData,
          formData.images,
          specifications
        );
      } else {
        // Create new product
        savedProduct = await ProductService.createProduct(
          productData,
          formData.images,
          specifications
        );
      }

      // Handle variants
      if (savedProduct) {
        try {
          // Check if product previously had variants
          const existingVariants = isEditMode && id ? 
            await ProductService.getProductVariants(parseInt(id)) : [];
          
          if (formData.hasVariants) {
            // First, fetch the images that were just saved to get their database IDs
            let actualImageIdsMap: Record<string, number> = {};
            try {
              const { data: savedImages, error: imagesError } = await supabase
                .from('product_images')
                .select('id, cloudinary_public_id')
                .eq('product_id', savedProduct.id);
              
              if (!imagesError && savedImages) {
                // Create a map from cloudinary public ID to database ID
                actualImageIdsMap = savedImages.reduce((acc, img) => {
                  if (img.cloudinary_public_id) {
                    acc[img.cloudinary_public_id] = img.id;
                  }
                  return acc;
                }, {} as Record<string, number>);
                
                console.log('Actual image IDs map:', actualImageIdsMap);
              }
            } catch (imagesFetchError) {
              console.warn('Failed to fetch saved images:', imagesFetchError);
            }
            
            // Transform variants to use actual database image IDs
            const transformedVariants = formData.variants.map((variant, index) => {
              // Map the selected image IDs to actual database IDs using Cloudinary public IDs
              let actualSelectedImageIds: number[] = [];
              if (variant.selectedImageIds && variant.selectedImageIds.length > 0) {
                console.log(`Mapping image IDs for variant ${index}:`, variant.selectedImageIds);
                console.log(`Form data images:`, formData.images);
                console.log(`Actual image IDs map:`, actualImageIdsMap);
                
                actualSelectedImageIds = variant.selectedImageIds
                  .map(imageId => {
                    // Find the image in formData.images that matches this ID
                    const image = formData.images.find(img => {
                      const imgId = parseInt(img.id || '0');
                      return imgId === imageId;
                    });
                    console.log(`Found image for ID ${imageId}:`, image);
                    
                    // Use the Cloudinary public ID to find the actual database ID
                    if (image && image.publicId && actualImageIdsMap[image.publicId]) {
                      const mappedId = actualImageIdsMap[image.publicId];
                      console.log(`Mapped image ID ${imageId} to database ID ${mappedId} using public ID ${image.publicId}`);
                      return mappedId;
                    }
                    console.log(`No mapping found for image ID ${imageId}`);
                    return null;
                  })
                  .filter((id): id is number => id !== null);
                
                console.log(`Final mapped image IDs for variant ${index}:`, actualSelectedImageIds);
              }
              
              // Log the transformation for debugging
              console.log(`Variant ${index} transformation:`, {
                original: variant.selectedImageIds,
                transformed: actualSelectedImageIds
              });
              
              return {
                ...variant,
                selectedImageIds: actualSelectedImageIds
              };
            });
            
            // Product should have variants
            if (isEditMode && id) {
              // Update existing variants
              await ProductService.updateProductVariants(
                savedProduct.id,
                formData.variantOptions,
                transformedVariants
              );
            } else {
              // Create new variants
              await ProductService.createProductVariants(
                savedProduct.id,
                formData.variantOptions,
                transformedVariants
              );
            }
          } else if (existingVariants.length > 0) {
            // Product previously had variants but now shouldn't have any
            // Delete existing variants
            await ProductService.deleteProductVariants(savedProduct.id);
          }
        } catch (variantError) {
          console.error('Error saving variants:', variantError);
          toast({
            title: 'Warning',
            description: 'Product saved but variants could not be saved. Please add variants manually.',
            variant: 'destructive',
          });
        }
        
        // Optional: Upload and save product music if provided
        try {
          if (formData.enableMusic && formData.musicFile) {
            await AdminService.uploadProductMusic(
              savedProduct.id,
              formData.musicFile,
              {
                title: formData.musicTitle || undefined,
                artist: formData.musicArtist || undefined,
                startAtSeconds: typeof formData.musicStartAtSeconds === 'number' ? formData.musicStartAtSeconds : 0,
                endAtSeconds: formData.musicEndAtSeconds ?? null,
                priority: typeof formData.musicPriority === 'number' ? formData.musicPriority : 100,
                isActive: formData.musicIsActive !== false,
              }
            );
          }
        } catch (musicError) {
          console.error('Error uploading product music:', musicError);
          toast({
            title: 'Music Upload Skipped',
            description: 'Product saved, but music could not be uploaded. You can try again later.',
          });
        }
      }

      toast({
        title: isEditMode ? 'Product Updated Successfully' : 'Product Created Successfully',
        description: `${formData.name} has been ${isEditMode ? 'updated' : 'added to your catalog'}${savedProduct ? ` with ID: ${savedProduct.id}` : ''}`,
      });

      // Stay on the same page after save (mobile-safe)
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: isEditMode ? 'Error Updating Product' : 'Error Creating Product',
        description: error instanceof Error ? error.message : 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Open product preview in new tab
    const previewData = encodeURIComponent(JSON.stringify(formData));
    window.open(`/admin/products/preview?data=${previewData}`, '_blank');
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-muted-foreground">{isEditMode ? 'Update existing product details' : 'Create a new jewelry product with images and details'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => {
              const form = document.getElementById('product-form') as HTMLFormElement | null;
              if (form) {
                const anyForm = form as any;
                if (typeof anyForm.requestSubmit === 'function') {
                  anyForm.requestSubmit();
                } else {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }
            }}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6 w-full max-w-full">
            {/* Basic Information */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the main product details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="w-full max-w-full">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Diamond Solitaire Ring"
                    required
                    className="w-full"
                  />
                </div>

                <div className="w-full max-w-full">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product in detail..."
                    rows={4}
                    required
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="w-full">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="comparePrice">Compare At Price (₹)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      value={formData.comparePrice || ''}
                      onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="w-full">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Variants */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Add size, color, and other variant options for this product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onCheckedChange={(checked) => handleInputChange('hasVariants', checked)}
                  />
                  <Label htmlFor="hasVariants">This product has variants (sizes, colors, etc.)</Label>
                </div>

                {formData.hasVariants && (
                  <div className="space-y-6">
                    {/* Variant Options */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Variant Options</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVariantOption}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>

                      {formData.variantOptions.map((option, optionIndex) => (
                        <div key={optionIndex} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Option {optionIndex + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantOption(optionIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label>Name (Internal)</Label>
                              <Input
                                value={option.name}
                                onChange={(e) => handleVariantOptionChange(optionIndex, 'name', e.target.value)}
                                placeholder="e.g., size"
                              />
                            </div>
                            <div>
                              <Label>Display Name</Label>
                              <Input
                                value={option.displayName}
                                onChange={(e) => handleVariantOptionChange(optionIndex, 'displayName', e.target.value)}
                                placeholder="e.g., Ring Size"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Values</Label>
                            {option.values.map((value, valueIndex) => (
                              <div key={valueIndex} className="flex gap-2">
                                <Input
                                  value={value.value}
                                  onChange={(e) => handleVariantOptionValueChange(optionIndex, valueIndex, 'value', e.target.value)}
                                  placeholder="e.g., small"
                                  className="flex-1"
                                />
                                <Input
                                  value={value.displayValue}
                                  onChange={(e) => handleVariantOptionValueChange(optionIndex, valueIndex, 'displayValue', e.target.value)}
                                  placeholder="e.g., S"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVariantOptionValue(optionIndex, valueIndex)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addVariantOptionValue(optionIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Value
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Generate Variants Button */}
                    {formData.variantOptions.length > 0 && (
                      <div className="pt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={generateVariants}
                        >
                          Generate Variants
                        </Button>
                      </div>
                    )}

                    {/* Generated Variants */}
                    {formData.variants.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Generated Variants</h3>
                        {formData.variants.map((variant, variantIndex) => (
                          <div key={variantIndex} className="border rounded-lg p-4 space-y-3">
                            <h4 className="font-medium">
                              {variantIndex === 0 ? `Base Product` : `Variant ${variantIndex}`}
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label>Display Name</Label>
                                <Input
                                  value={variant.name}
                                  onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                                  placeholder={variantIndex === 0 ? formData.name || "Base Product" : "Variant name"}
                                />
                              </div>
                              <div>
                                <Label>Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variantIndex, 'price', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <Label>Stock Quantity</Label>
                                <Input
                                  type="number"
                                  value={variant.stockQuantity}
                                  onChange={(e) => handleVariantChange(variantIndex, 'stockQuantity', parseInt(e.target.value) || 0)}
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Show option values for all variants including base product */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {variant.optionValues.map((optionValue, optionValueIndex) => {
                                const option = formData.variantOptions.find(o => o.name === optionValue.optionName);
                                return (
                                  <div key={optionValueIndex}>
                                    <Label>{option?.displayName || optionValue.optionName}</Label>
                                    <Select
                                      value={optionValue.value}
                                      onValueChange={(value) => handleVariantOptionValueChangeInVariant(variantIndex, optionValue.optionName, value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {option?.values.map((val, valIndex) => (
                                          <SelectItem key={valIndex} value={val.value}>
                                            {val.displayValue}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                );
                              })}
                              {/* For base product, show a message if there are no options */}
                              {variantIndex === 0 && variant.optionValues.length === 0 && formData.variantOptions.length > 0 && (
                                <div className="col-span-full text-sm text-muted-foreground">
                                  This is the base product variant with no specific options selected.
                                </div>
                              )}
                            </div>

                            {/* Image Selection for Variants */}
                            <div className="space-y-2">
                              <Label>Select Images for this Variant</Label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {formData.images.map((image, imageIndex) => {
                                  // Parse the image ID to ensure it's a valid number
                                  const imageId = image.id ? (typeof image.id === 'string' ? parseInt(image.id, 10) : image.id) : 0;
                                  const isValidId = imageId && !isNaN(imageId);
                                  
                                  console.log(`Rendering image ${imageIndex}:`, { id: image.id, parsedId: imageId, isValid: isValidId });
                                  
                                  return (
                                    <div key={image.id || imageIndex} className="relative">
                                      <img
                                        src={image.url}
                                        alt={image.originalName}
                                        className="w-full h-20 object-cover rounded border"
                                      />
                                      {isValidId && (
                                        <div className="absolute top-1 right-1">
                                          <Checkbox
                                            id={`variant-${variantIndex}-image-${imageIndex}`}
                                            checked={variant.selectedImageIds.includes(imageId)}
                                            onCheckedChange={(checked) => 
                                              handleVariantImageSelection(
                                                variantIndex, 
                                                imageId, 
                                                checked as boolean
                                              )
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Product Media</CardTitle>
                <CardDescription>Upload high-quality images or videos of your product</CardDescription>
              </CardHeader>
              <CardContent className="w-full max-w-full">
                <ImageUpload
                  onImagesChange={handleImagesChange}
                  maxImages={8}
                  existingImages={formData.images}
                  productId={isEditMode && id ? parseInt(id) : undefined}
                />
              </CardContent>
            </Card>

            {/* Reel Music (Optional) */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Reel Music (Optional)</CardTitle>
                <CardDescription>Attach a soundtrack for this product's reel. You can skip this section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableMusic"
                    checked={!!formData.enableMusic}
                    onCheckedChange={(checked) => handleInputChange('enableMusic', !!checked)}
                  />
                  <Label htmlFor="enableMusic">Enable music for this product</Label>
                </div>

                {formData.enableMusic && (
                  <div className="space-y-4">
                    <div className="w-full">
                      <Label htmlFor="musicFile">Upload Audio File</Label>
                      <Input
                        id="musicFile"
                        type="file"
                        accept="audio/*,video/mp4"
                        onChange={(e) => {
                          const file = e.currentTarget.files && e.currentTarget.files[0] ? e.currentTarget.files[0] : null;
                          handleInputChange('musicFile', file);
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Accepted: audio/* (Cloudinary will store under video resources). Optional.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="w-full">
                        <Label htmlFor="musicTitle">Title</Label>
                        <Input
                          id="musicTitle"
                          value={formData.musicTitle || ''}
                          onChange={(e) => handleInputChange('musicTitle', e.target.value)}
                          placeholder="e.g., Golden Vibes"
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="musicArtist">Artist</Label>
                        <Input
                          id="musicArtist"
                          value={formData.musicArtist || ''}
                          onChange={(e) => handleInputChange('musicArtist', e.target.value)}
                          placeholder="e.g., DJ Ehsaas"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="w-full">
                        <Label htmlFor="musicStartAtSeconds">Start at (seconds)</Label>
                        <Input
                          id="musicStartAtSeconds"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.musicStartAtSeconds ?? 0}
                          onChange={(e) => handleInputChange('musicStartAtSeconds', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="musicEndAtSeconds">End at (seconds)</Label>
                        <Input
                          id="musicEndAtSeconds"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.musicEndAtSeconds ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            handleInputChange('musicEndAtSeconds', v === '' ? null : (parseInt(v) || 0));
                          }}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="w-full">
                        <Label htmlFor="musicPriority">Priority</Label>
                        <Input
                          id="musicPriority"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.musicPriority ?? 100}
                          onChange={(e) => handleInputChange('musicPriority', parseInt(e.target.value) || 100)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="musicIsActive"
                        checked={formData.musicIsActive !== false}
                        onCheckedChange={(checked) => handleInputChange('musicIsActive', !!checked)}
                      />
                      <Label htmlFor="musicIsActive">Active</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Specifications */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Technical details about the product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="w-full">
                    <Label htmlFor="material">Material</Label>
                    <Select
                      value={formData.material}
                      onValueChange={(value) => handleInputChange('material', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label htmlFor="gemstone">Gemstone</Label>
                    <Select
                      value={formData.gemstone}
                      onValueChange={(value) => handleInputChange('gemstone', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gemstone" />
                      </SelectTrigger>
                      <SelectContent>
                        {gemstones.map((gemstone) => (
                          <SelectItem key={gemstone} value={gemstone}>
                            {gemstone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="w-full">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="e.g., 2.5g"
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="purity">Purity</Label>
                    <Input
                      id="purity"
                      value={formData.purity}
                      onChange={(e) => handleInputChange('purity', e.target.value)}
                      placeholder="e.g., 18K, 925 Silver"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="e.g., 15mm x 10mm"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Settings */}
          <div className="space-y-6 w-full max-w-full">
            {/* Inventory */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="w-full">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel || ''}
                    onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active (visible to customers)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                  <Label htmlFor="isFeatured">Featured product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSponsored"
                    checked={formData.isSponsored}
                    onCheckedChange={(checked) => handleInputChange('isSponsored', checked)}
                  />
                  <Label htmlFor="isSponsored">Sponsored</Label>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="w-full max-w-full">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full max-w-full">
                <div className="w-full">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="wedding, engagement, gold"
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={formData.warranty}
                    onChange={(e) => handleInputChange('warranty', e.target.value)}
                    placeholder="e.g., 1 year manufacturer warranty"
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="careInstructions">Care Instructions</Label>
                  <Textarea
                    id="careInstructions"
                    value={formData.careInstructions}
                    onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                    placeholder="How to care for this product..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}