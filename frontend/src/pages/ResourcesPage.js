import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  LocalHospital as HospitalIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  Favorite as HeartIcon,
} from '@mui/icons-material';

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources, setResources] = useState([]);

  // Mock resources data
  const mockResources = [
    {
      id: 1,
      title: 'National Suicide Prevention Lifeline',
      description: '24/7 free and confidential support for people in distress, prevention and crisis resources.',
      category: 'crisis',
      type: 'hotline',
      contact: '988',
      url: 'https://suicidepreventionlifeline.org',
      isEmergency: true,
    },
    {
      id: 2,
      title: 'Crisis Text Line',
      description: 'Text HOME to 741741 to reach the Crisis Text Line for free, 24/7 crisis support.',
      category: 'crisis',
      type: 'text',
      contact: '741741',
      url: 'https://crisistextline.org',
      isEmergency: true,
    },
    {
      id: 3,
      title: 'Anxiety and Depression Management',
      description: 'Comprehensive guide to understanding and managing anxiety and depression symptoms.',
      category: 'education',
      type: 'article',
      url: 'https://example.com/anxiety-depression',
      isEmergency: false,
    },
    {
      id: 4,
      title: 'Mindfulness Meditation Videos',
      description: 'Collection of guided meditation videos for stress relief and mental clarity.',
      category: 'wellness',
      type: 'video',
      url: 'https://example.com/meditation',
      isEmergency: false,
    },
    {
      id: 5,
      title: 'Local Mental Health Clinics',
      description: 'Find mental health professionals and clinics in your area.',
      category: 'professional',
      type: 'directory',
      url: 'https://example.com/find-help',
      isEmergency: false,
    },
    {
      id: 6,
      title: 'Workplace Stress Management',
      description: 'Strategies for managing work-related stress and maintaining work-life balance.',
      category: 'workplace',
      type: 'article',
      url: 'https://example.com/workplace-stress',
      isEmergency: false,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'crisis', label: 'Crisis Support' },
    { value: 'education', label: 'Educational' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'professional', label: 'Professional Help' },
    { value: 'workplace', label: 'Workplace' },
  ];

  const faqs = [
    {
      question: 'When should I seek professional help?',
      answer: 'Consider seeking professional help if you experience persistent sadness, anxiety, changes in sleep or appetite, difficulty functioning at work or in relationships, or thoughts of self-harm. Early intervention can be very beneficial.',
    },
    {
      question: 'Is my information confidential?',
      answer: 'Yes, mental health professionals are bound by confidentiality laws. They can only share information in specific circumstances, such as if there is immediate danger to yourself or others.',
    },
    {
      question: 'What types of therapy are available?',
      answer: 'There are many types of therapy including cognitive behavioral therapy (CBT), dialectical behavior therapy (DBT), psychodynamic therapy, and more. A mental health professional can help determine what might work best for you.',
    },
    {
      question: 'How do I know if I need medication?',
      answer: 'Only a qualified healthcare provider can determine if medication might be helpful for your situation. They will consider your symptoms, medical history, and other factors to make this decision.',
    },
  ];

  useEffect(() => {
    setResources(mockResources);
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getResourceIcon = (type) => {
    switch (type) {
      case 'hotline':
      case 'text':
        return <PhoneIcon />;
      case 'article':
        return <ArticleIcon />;
      case 'video':
        return <VideoIcon />;
      case 'directory':
        return <HospitalIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Mental Health Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find support, information, and professional help for your mental wellness journey.
        </Typography>
      </Box>

      {/* Emergency Notice */}
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        icon={<HeartIcon />}
      >
        <Typography variant="h6" gutterBottom>
          Need Immediate Help?
        </Typography>
        <Typography variant="body2">
          If you're in crisis or having thoughts of self-harm, please reach out immediately:
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button
            variant="contained"
            color="error"
            href="tel:988"
            sx={{ mr: 2, mb: 1 }}
          >
            Call 988
          </Button>
          <Button
            variant="outlined"
            color="error"
            href="sms:741741"
            sx={{ mb: 1 }}
          >
            Text 741741
          </Button>
        </Box>
      </Alert>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <Chip
                    key={category.value}
                    label={category.label}
                    onClick={() => setSelectedCategory(category.value)}
                    color={selectedCategory === category.value ? 'primary' : 'default'}
                    variant={selectedCategory === category.value ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: resource.isEmergency ? '2px solid' : 'none',
                borderColor: resource.isEmergency ? 'error.main' : 'transparent',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getResourceIcon(resource.type)}
                  <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                    {resource.title}
                  </Typography>
                </Box>
                
                {resource.isEmergency && (
                  <Chip 
                    label="Emergency Resource" 
                    color="error" 
                    size="small" 
                    sx={{ mb: 2 }}
                  />
                )}
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {resource.description}
                </Typography>
                
                {resource.contact && (
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Contact: {resource.contact}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<LaunchIcon />}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access Resource
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResourcesPage; 