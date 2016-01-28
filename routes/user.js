/* jshint esnext: true */

module.exports = (ctx)=>
{
    var baseurl = ctx.config.server.api + '/user';
    //var ObjectId = require('mongodb').ObjectId;

    //var userFields = {'_id':1,'username':1,'displayname':1,'image':1,'email':1,'following':1};

    // get the user using login and password
    ctx.app.get( baseurl + '/authenticate/:username/:password',(req,res)=> {
        var username = req.params.username;
        var password = req.params.password;

        ctx.db.collection('users').findOne({'username':username,'password':password},(err,data)=> {
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            if (data) {
                ctx.util.action.jsonResult(req,res,{
                    "username": data.username,
                    "displayname": data.displayname,
                    "password": data.password,
                    "email": data.email,
                    "image": data.image,
                    "followingcount": data.following.length,
                    "followercount": data.followers.length
                });
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
        });
    });

    // get the user using a username
    ctx.app.get( baseurl + '/access/:username', (req,res)=> {
        var username = req.params.username;

        ctx.db.collection('users').findOne({'username':username},(err, data)=>{
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            if (data) {
                ctx.util.action.jsonResult(req,res,{
                    "username": data.username,
                    "displayname": data.displayname,
                    "password": data.password,
                    "email": data.email,
                    "image": data.image,
                    "followingcount": data.following.length,
                    "followercount": data.followers.length
                });
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
        });
    });

    // get the following of a user
    ctx.app.get( baseurl + '/following/:username',(req,res)=> {
        var username = req.params.username;

        ctx.db.collection('users').findOne({'username':username},(err, data)=>
        {
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            if (data) {
                ctx.db.collection('users').find({'followers':data._id}).toArray((err,items)=> {
                    if(err) return ctx.util.action.errorResult(err.message,req,res);

                    ctx.util.action.jsonResult(req, res, items);
                });
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
        });
    });

    // get the followers of a user
    ctx.app.get( baseurl + '/followers/:username',(req,res)=> {
        var username = req.params.username;

        ctx.db.collection('users').findOne({'username':username},(err,data)=> {
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            if (data) {
                ctx.db.collection('users').find({'following':data._id}).toArray((err,items)=> {
                    if(err) return ctx.util.action.errorResult(err.message,req,res);

                    ctx.util.action.jsonResult(req, res, items);
                });
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
        });
    });

    // sign up a new user
    ctx.app.post( baseurl,(req,res)=> {
      var username = req.body.username;
      var password = req.body.password;
      var displayname = req.body.displayname;
      var email = req.body.email;

      var user = {
          "username": username,
          "displayname": displayname,
          "password": password,
          "email": email,
          "image": ctx.config.image,
          "following": [],
          "followers": []
      };

      ctx.db.collection('users').save(user,(err)=> {
          if(err) return ctx.util.action.errorResult(err.message,req,res);

          ctx.util.action.okResult(req,res);
      });
    });

    // follow an user
    ctx.app.post( baseurl + '/follow',  (req,res)=> {
      var username = req.body.username1;
      var follow = req.body.username2;

      //ctx.logger.debug(username);
      //ctx.logger.debug(follow);

      ctx.db.collection('users').findOne({'username':username},(err,user1)=> {
        if(err) return ctx.util.action.errorResult(err.message,req,res);

        if (user1) {
          ctx.db.collection('users').findOne({'username':follow},(err,user2)=> {
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            // check if already follow
            if(user2) {
              var found = false;
              for (i = 0; i < user1.following.length; i++) {
                if(user1.following[i]==user2._id)
                {
                  found = true;
                  break;
                }
              }

              if( found ) {
                ctx.logger.debug('[%s] already follow [%s]',user1.username,user2.username);
                ctx.util.action.forbiddenResult(req,res);
                return;
              }

              ctx.db.collection('users')
                    .updateOne({_id:user1._id},{$push: {following:user2._id }})
                    .then(()=>{
                      ctx.db.collection('users')
                            .updateOne({_id:user2._id},{$push: {followers:user1._id }});
                    });
              ctx.util.action.okResult(req,res);
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
          });
        }
        else {
            ctx.util.action.forbiddenResult(req,res);
        }
      });
    } );

    // follow an user
    ctx.app.post( baseurl + '/unfollow',(req,res)=> {
      var username = req.body.username1;
      var follow = req.body.username2;

      //ctx.logger.debug(username);
      //ctx.logger.debug(follow);

      ctx.db.collection('users').findOne({'username':username},(err,user1)=>{
        if(err) return ctx.util.action.errorResult(err.message,req,res);

        if (user1) {
          ctx.db.collection('users').findOne({'username':follow},(err,user2)=>{
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            // check if already follow
            if(user2) {
              var found = false;
              for (i = 0; i < user1.following.length; i++) {
                if(user1.following[i]==user2._id)
                {
                  found = true;
                  break;
                }
              }

              if( !found ) {
                ctx.logger.debug('[%s] does not follow [%s]',user1.username,user2.username);
                ctx.util.action.forbiddenResult(req,res);
                return;
              }

              ctx.db.collection('users')
                    .updateOne({_id:user1._id},{$pull: {following: user2._id }})
                    .then(()=>{
                      ctx.db.collection('users')
                            .updateOne({_id:user2._id},{$pull: {followers: user1._id }});
                    });
              ctx.util.action.okResult(req,res);
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
          });
        }
        else {
            ctx.util.action.forbiddenResult(req,res);
        }
      });
    } );

    // get the user info
    ctx.app.get( baseurl + '/info/:username',(req,res)=>{
        var username = req.params.username;

        ctx.db.collection('users').findOne({'username':username},(err,data)=>{
            if(err) return ctx.util.action.errorResult(err.message,req,res);

            if (data) {
                ctx.util.action.jsonResult(req,res,{
                    "username": data.username,
                    "displayname": data.displayname,
                    "password": data.password,
                    "email": data.email,
                    "image": data.image,
                    "followingcount": data.following.length,
                    "followercount": data.followers.length
                });
            }
            else {
                ctx.util.action.forbiddenResult(req,res);
            }
        });
    });
};