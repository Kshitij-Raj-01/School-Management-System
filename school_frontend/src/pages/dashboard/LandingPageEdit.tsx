import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  getLandingPageContent, 
  saveLandingPageContent, 
  resetLandingPageContent,
  type LandingPageContent 
} from "@/lib/landingPageContent";
import { Loader2, Save, RotateCcw, Home, Info, Images, Mail, Plus, Trash2, Upload } from "lucide-react";

const LandingPageEdit = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const isAdmin = userInfo?.role === "admin";

  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // State for upload spinner
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (isAdmin) {
      const loaded = getLandingPageContent();
      setContent(loaded);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Only admin can edit landing page content (Home, About, Gallery, Contact).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = () => {
    if (!content) return;
    setLoading(true);
    try {
      saveLandingPageContent(content);
      toast.success("Landing page content saved successfully! 🎉");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will reset all content to default values.")) {
      resetLandingPageContent();
      const defaultContent = getLandingPageContent();
      setContent(defaultContent);
      toast.success("Content reset to defaults");
    }
  };

  const updateContent = (section: keyof LandingPageContent, updates: any) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section],
        ...updates,
      },
    });
  };

  // --- Dynamic List Handlers (Add/Remove) ---

  const addFeature = () => {
    if (!content) return;
    const newFeature = {
      title: "New Feature",
      description: "Description of the new feature.",
      emoji: "✨"
    };
    const newFeatures = [...content.about.features, newFeature];
    updateContent("about", { features: newFeatures });
    toast.success("New feature added!");
  };

  const removeFeature = (index: number) => {
    if (!content) return;
    const newFeatures = content.about.features.filter((_, i) => i !== index);
    updateContent("about", { features: newFeatures });
    toast.success("Feature removed.");
  };

  const addImage = () => {
    if (!content) return;
    const newImage = {
      src: "",
      title: "New Image",
      category: "Activities",
      emoji: "📷"
    };
    const newImages = [...content.gallery.images, newImage];
    updateContent("gallery", { images: newImages });
    toast.success("New image card added!");
  };

  const removeImage = (index: number) => {
    if (!content) return;
    const newImages = content.gallery.images.filter((_, i) => i !== index);
    updateContent("gallery", { images: newImages });
    toast.success("Image removed.");
  };

  // --- Local Image Upload Logic (Base64) ---
  const handleImageUpload = (file: File, index: number) => {
    if (!file) return;

    // Check size (Limit to 500KB to keep LocalStorage happy)
    if (file.size > 500 * 1024) {
      toast.error("File is too large! Please upload an image smaller than 500KB.");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      if (content) {
        const newImages = [...content.gallery.images];
        newImages[index] = { ...newImages[index], src: base64String };
        updateContent("gallery", { images: newImages });
        toast.success("Image uploaded!");
      }
      setUploadingImage(false);
    };

    reader.onerror = () => {
      toast.error("Failed to read file.");
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Landing Page Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit Home, About, Gallery, and Contact sections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={loading || uploadingImage}>
            {loading || uploadingImage ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">
            <Home className="w-4 h-4 mr-2" />
            Home
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="w-4 h-4 mr-2" />
            About
          </TabsTrigger>
          <TabsTrigger value="gallery">
            <Images className="w-4 h-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="w-4 h-4 mr-2" />
            Contact
          </TabsTrigger>
        </TabsList>

        {/* HOME TAB */}
        <TabsContent value="home" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Home Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  value={content.home.badge}
                  onChange={(e) => updateContent("home", { badge: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.home.title}
                    onChange={(e) => updateContent("home", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.home.titleHighlight}
                    onChange={(e) => updateContent("home", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subtitle / Description</Label>
                <Textarea
                  value={content.home.subtitle}
                  onChange={(e) => updateContent("home", { subtitle: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Apply Button Text</Label>
                  <Input
                    value={content.home.applyButtonText}
                    onChange={(e) => updateContent("home", { applyButtonText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learn More Button Text</Label>
                  <Input
                    value={content.home.learnMoreButtonText}
                    onChange={(e) => updateContent("home", { learnMoreButtonText: e.target.value })}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-lg font-bold mb-4 block">Statistics</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Students Count</Label>
                    <Input
                      value={content.home.stats.students.value}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            students: { ...content.home.stats.students, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats.students.label}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            students: { ...content.home.stats.students, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ratio</Label>
                    <Input
                      value={content.home.stats.ratio.value}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            ratio: { ...content.home.stats.ratio, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats.ratio.label}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            ratio: { ...content.home.stats.ratio, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years</Label>
                    <Input
                      value={content.home.stats.years.value}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            years: { ...content.home.stats.years, value: e.target.value },
                          },
                        })
                      }
                    />
                    <Input
                      value={content.home.stats.years.label}
                      onChange={(e) =>
                        updateContent("home", {
                          stats: {
                            ...content.home.stats,
                            years: { ...content.home.stats.years, label: e.target.value },
                          },
                        })
                      }
                      placeholder="Label"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.about.title}
                    onChange={(e) => updateContent("about", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.about.titleHighlight}
                    onChange={(e) => updateContent("about", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.about.description}
                  onChange={(e) => updateContent("about", { description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Title</Label>
                <Input
                  value={content.about.missionTitle}
                  onChange={(e) => updateContent("about", { missionTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Text</Label>
                <Textarea
                  value={content.about.missionText}
                  onChange={(e) => updateContent("about", { missionText: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-bold">Features</Label>
                  <Button size="sm" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                  </Button>
                </div>
                
                {content.about.features.map((feature, index) => (
                  <Card key={index} className="mb-4 bg-muted/20">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <Label>Feature {index + 1} - Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...content.about.features];
                              newFeatures[index] = { ...feature, title: e.target.value };
                              updateContent("about", { features: newFeatures });
                            }}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 mt-6"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...content.about.features];
                            newFeatures[index] = { ...feature, description: e.target.value };
                            updateContent("about", { features: newFeatures });
                          }}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emoji</Label>
                        <Input
                          value={feature.emoji}
                          onChange={(e) => {
                            const newFeatures = [...content.about.features];
                            newFeatures[index] = { ...feature, emoji: e.target.value };
                            updateContent("about", { features: newFeatures });
                          }}
                          placeholder="📚"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GALLERY TAB */}
        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.gallery.title}
                    onChange={(e) => updateContent("gallery", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.gallery.titleHighlight}
                    onChange={(e) => updateContent("gallery", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.gallery.description}
                  onChange={(e) => updateContent("gallery", { description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-bold">Gallery Images</Label>
                  <Button size="sm" onClick={addImage} variant="outline">
                    <Plus className="w-4 h-4 mr-2" /> Add Image
                  </Button>
                </div>

                {content.gallery.images.map((image, index) => (
                  <Card key={index} className="mb-4 bg-muted/20">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <Label>Image {index + 1} Source</Label>
                          <div className="flex gap-2 items-center">
                            {/* URL Input */}
                            <Input
                              value={image.src}
                              onChange={(e) => {
                                const newImages = [...content.gallery.images];
                                newImages[index] = { ...image, src: e.target.value };
                                updateContent("gallery", { images: newImages });
                              }}
                              placeholder="/image.jpg or https://..."
                              className="flex-1"
                            />
                            
                            {/* Upload Button Logic */}
                            <div className="relative">
                              <Input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if(file) handleImageUpload(file, index);
                                }}
                                disabled={uploadingImage}
                              />
                              <Button variant="outline" size="icon" disabled={uploadingImage} title="Upload from Computer">
                                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Enter a URL or click upload to pick a file (max 500KB)</p>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 mt-6"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Preview */}
                      {image.src && (
                        <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden border">
                          <img 
                            src={image.src} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={image.title}
                          onChange={(e) => {
                            const newImages = [...content.gallery.images];
                            newImages[index] = { ...image, title: e.target.value };
                            updateContent("gallery", { images: newImages });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input
                            value={image.category}
                            onChange={(e) => {
                              const newImages = [...content.gallery.images];
                              newImages[index] = { ...image, category: e.target.value };
                              updateContent("gallery", { images: newImages });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Emoji</Label>
                          <Input
                            value={image.emoji}
                            onChange={(e) => {
                              const newImages = [...content.gallery.images];
                              newImages[index] = { ...image, emoji: e.target.value };
                              updateContent("gallery", { images: newImages });
                            }}
                            placeholder="🎒"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title (Part 1)</Label>
                  <Input
                    value={content.contact.title}
                    onChange={(e) => updateContent("contact", { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (Highlighted Part)</Label>
                  <Input
                    value={content.contact.titleHighlight}
                    onChange={(e) => updateContent("contact", { titleHighlight: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={content.contact.description}
                  onChange={(e) => updateContent("contact", { description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={content.contact.phone}
                    onChange={(e) => updateContent("contact", { phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => updateContent("contact", { email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={content.contact.address}
                    onChange={(e) => updateContent("contact", { address: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input
                  value={content.contact.formTitle}
                  onChange={(e) => updateContent("contact", { formTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Form Description</Label>
                <Textarea
                  value={content.contact.formDescription}
                  onChange={(e) => updateContent("contact", { formDescription: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LandingPageEdit;