module.exports = app => {
  const { router, controller } = app;
  router.get('/index', controller.home.index);
  router.post('/upload',controller.home.upload)
  router.post('/uploadList',controller.home.uploadList)

};