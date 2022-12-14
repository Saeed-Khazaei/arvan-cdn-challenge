import React, { useEffect, useState } from 'react';
import {
  Card,
  Stack,
  TextField,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Snackbar,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Article, ArticleUpdate } from '../models/articles';
import articles from '../services/articles';
import { useRouter } from 'next/router';
import tags from '../services/tags';
import { NotificationType } from '../models/notification';
import Notification from './Notification';

const EditArticle = (props: {
  articleData: Article;
  slug: string;
  create: boolean;
}) => {
  const router = useRouter();
  const [showSnackBar, setSnackBar] = useState<NotificationType>({
    open: false,
    message: '',
    mainMessage: '',
    type: 'success',
  });
  const handleCloseSnackBar = () => {
    setSnackBar({ open: false, message: '', mainMessage: '', type: 'error' });
  };
  const [tagText, setTagText] = useState('');
  const [loadingOnSave, setLoadingOnSave] = useState(false);
  const [errors, setErrors] = useState({
    title: {
      isError: false,
      errorMessage: '',
    },
    description: {
      isError: false,
      errorMessage: '',
    },
    body: {
      isError: false,
      errorMessage: '',
    },
    tags: {
      isError: false,
      errorMessage: '',
    },
  });
  const [articleData, setArticleData] = useState<Article>({
    slug: '',
    title: '',
    description: '',
    body: '',
    tagList: [],
    createdAt: '',
    updatedAt: '',
    favorited: false,
    favoritesCount: 0,
    author: {
      username: '',
      bio: null,
      image: '',
      following: false,
    },
  });
  const [tagsData, setTagsData] = useState<string[]>([]);
  const onSubmit = () => {
    // setLoading(true);
    if (props.create) {
      onCreateArticle();
    } else {
      onUpdateArticle();
    }
  };

  const onToggleTag = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      setArticleData({
        ...articleData,
        tagList: [...articleData?.tagList, event.target.name].sort(),
      });
    } else {
      setArticleData({
        ...articleData,
        tagList: [...articleData?.tagList]
          .filter((i) => i != event.target.name)
          .sort(),
      });
    }
  };

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, title: { errorMessage: '', isError: false } });
    setArticleData({ ...articleData, title: e.target.value });
  };

  const onChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, description: { errorMessage: '', isError: false } });
    setArticleData({ ...articleData, description: e.target.value });
  };

  const onChangeBody = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors({ ...errors, body: { errorMessage: '', isError: false } });
    setArticleData({ ...articleData, body: e.target.value });
  };
  const onChangeTagText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagText(e.target.value);
  };

  const keyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') {
      const mySet = new Set<string>([...tagsData, tagText]);
      const newTags = Array.from(mySet).sort();
      setTagsData(newTags);
      setArticleData({
        ...articleData,
        tagList: [...articleData.tagList, tagText].sort(),
      });
    }
  };

  const fetchTags = async () => {
    try {
      const res = await tags.getTags();
      setTagsData(res.tags.sort());
    } catch (error: any) {
      console.log('error', error.message);
    }
  };

  const onUpdateArticle = async () => {
    let body: ArticleUpdate = {
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
    };
    if (props.slug) {
      setLoadingOnSave(true);
      try {
        const res = await articles.updateArticle(props.slug, {
          ...body,
        });
        setLoadingOnSave(false);
        setSnackBar({
          open: true,
          message: 'Article updated successfly',
          mainMessage: 'Well done!',
          type: 'success',
        });

        if (props.slug !== res.article.slug) {
          router.push({
            pathname: `/articles/edit/${res.article.slug}`,
          });
        }
      } catch (error: any) {
        setLoadingOnSave(false);
        if (error.title) {
          setErrors({
            ...errors,
            title: { errorMessage: error.title[0], isError: true },
          });
        }
        if (error.description) {
          setErrors({
            ...errors,
            description: { errorMessage: error.description[0], isError: true },
          });
        }
        if (error.body) {
          setErrors({
            ...errors,
            body: { errorMessage: error.body[0], isError: true },
          });
        }
        console.log('error', error.message);
      }
    }
    return;
  };
  const onCreateArticle = async () => {
    let body: ArticleUpdate = {
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      tagList: articleData.tagList,
    };
    try {
      setLoadingOnSave(true);
      const res = await articles.postArticle({
        ...body,
      });
      setLoadingOnSave(false);
      setSnackBar({
        open: true,
        message: 'Article created successfly',
        mainMessage: 'Well done!',
        type: 'success',
      });
    } catch (error: any) {
      setLoadingOnSave(false);
      if (error.title) {
        setErrors({
          ...errors,
          title: { errorMessage: error.title[0], isError: true },
        });
      }
      if (error.description) {
        setErrors({
          ...errors,
          description: { errorMessage: error.description[0], isError: true },
        });
      }
      if (error.body) {
        setErrors({
          ...errors,
          body: { errorMessage: error.body[0], isError: true },
        });
      }
      console.log('error', error);
    }
    return;
  };

  useEffect(() => {
    fetchTags();
    setArticleData(props.articleData);
  }, []);

  return (
    <>
      <Notification
        open={showSnackBar.open}
        message={showSnackBar.message}
        mainMessage={showSnackBar.mainMessage}
        type={showSnackBar.type}
        onClose={handleCloseSnackBar}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
        <Stack sx={{ flex: 9 }} spacing={3}>
          <TextField
            id="title"
            label="Title"
            variant="outlined"
            type="text"
            fullWidth
            error={errors.title.isError}
            helperText={errors.title.isError && errors.title.errorMessage}
            placeholder="Title"
            value={articleData?.title ?? ''}
            onChange={onChangeTitle}
          />
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            type="text"
            fullWidth
            error={errors.description.isError}
            helperText={
              errors.description.isError && errors.description.errorMessage
            }
            placeholder="Description"
            value={articleData?.description ?? ''}
            onChange={onChangeDescription}
          />
          <TextField
            id="body"
            label="Body"
            variant="outlined"
            type="text"
            fullWidth
            multiline
            rows={10}
            error={errors.body.isError}
            helperText={errors.body.isError && errors.body.errorMessage}
            value={articleData?.body ?? ''}
            onChange={onChangeBody}
          />
        </Stack>
        <Stack sx={{ flex: 3 }} spacing={1}>
          <TextField
            id="tags"
            label="Tags"
            variant="outlined"
            type="text"
            fullWidth
            error={false}
            helperText={''}
            placeholder="New tag"
            onChange={onChangeTagText}
            onKeyDown={keyPress}
          />
          <Card variant="outlined">
            <CardContent>
              <FormGroup>
                {tagsData.length > 0 &&
                  tagsData.map((t) => (
                    <FormControlLabel
                      key={t}
                      control={
                        <Checkbox
                          color="primary"
                          name={t}
                          checked={
                            articleData.tagList.length &&
                            articleData.tagList.find((i) => i == t)
                              ? true
                              : false
                          }
                          onChange={onToggleTag}
                        />
                      }
                      label={t}
                    />
                  ))}
              </FormGroup>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
      <Button
        color="primary"
        variant="contained"
        size="large"
        sx={{ maxWidth: 'max-content' }}
        onClick={onSubmit}
        disabled={loadingOnSave}
      >
        {loadingOnSave ? (
          <CircularProgress size="22px" color="inherit" />
        ) : (
          'Submit'
        )}
      </Button>
    </>
  );
};

export default EditArticle;
