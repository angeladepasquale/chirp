module.exports = function(ctx)
{
    var limit = ctx.config.limit;
    var baseurl = ctx.config.server.api;

    var postListFields = {'username':1,'displayname':1,'timestamp':1,'text':1,'image':1};
    var userSearchFields = {'_id':1,'following':1,'displayname':1,'image':1};

    // get items posted to public timeline
    ctx.app.get( baseurl + '/post/public', function(req,res) {
        ctx.db.collection('posts').find({},{'limit':limit,'fields': postListFields,'sort': {'timestamp':-1}})
            .toArray(function(err,data) {
                if(err) throw err;

                ctx.helper.sendJson(req,res,data);
            });
    });

    // get items posted to user timeline
    ctx.app.get( baseurl + '/post/home/:token', function(req,res) {
        var token = req.params.token;

        ctx.db.collection('users').findOne({'username':token},{'limit':limit,'fields':{'_id': 1}}, function(err, data) {
            if (data) {
                ctx.db.collection('posts').find({'targetusers': data._id},{'fields': postListFields,'sort':{'timestamp':-1}})
                    .toArray(function (err, items) {
                        if (err) throw err;

                        ctx.helper.sendJson(req,res,items);
                    });
            }
            else {
                ctx.helper.sendJson(req, res);
            }
        });
    });

    // get the items posted from an user
    ctx.app.get( baseurl + '/post/:username', function(req,res) {
        var username = req.params.username;

        ctx.db.collection('posts').find({'username': username},{'fields': postListFields,'sort': {'timestamp':-1}})
            .toArray(function (err, items) {
                if (err) throw err;

                ctx.helper.sendJson(req, res, items);
            });
    });

    // post a new message
    ctx.app.post( baseurl + '/post', function(req,res) {
        var username = req.body.username;
        var text = req.body.text;

        ctx.db.collection('users').findOne({'username':username},{'fields':userSearchFields},function(err,data) {
                if (data) {
                    var newPost = {
                        "username": username,
                        "targetusers": data.following,
                        "displayname": data.displayname,
                        "timestamp": new Date().toISOString(),
                        "image": data.image,
                        "text": text
                    };

                    newPost.targetusers.push(data._id);

                    ctx.db.collection('posts').save(newPost,function(err)
                    {
                        if(err) throw err;

                        ctx.helper.sendJson(req,res,{'result':1});
                    });
                }
                else {
                    ctx.helper.sendJson(req,res,{'result':0});
                }
            });
    });
};