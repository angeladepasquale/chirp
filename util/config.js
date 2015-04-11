module.exports = function (ctx)
{
    ctx.config =
    {
        server: {
            api: '/api/v1',
            limit: '10'
        },
        image: 'defaultUser.png',
        mongodb: {
            connectionString: process.env.MDB
            //connectionString: 'mongodb://localhost/chirp'
        }
    }
}