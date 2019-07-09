'use strict';


module.exports = function (app) {

  var router = app.loopback.Router();
  var request = require('request');

  var prods, userId,t_cost=0,profileInfo,orderTrack=[];
  var currentCart = [];

  // action for root directory
  router.get('/', function (req, res) {

    //4.view supplied products of supplier
    var url = 'http://localhost:8000/api/products';
    request(url, function (err, response, body) {
      prods = JSON.parse(body); 
      console.log('view supplied products of supplier');
      console.log(prods);

      //render view to second page
      res.render('index', {
        prods: prods
      });

    });

  });

  router.get('/products', function (req, res) {
    //4.view supplied products of supplier
    var url = 'http://localhost:8000/api/products';
    request(url, function (err, response, body) {
      prods = JSON.parse(body); 
      console.log('view supplied products of supplier');
      console.log(prods);

      //render view to second page
      res.render('product', {
        prods: prods
      });

    });


  });
  router.post('/addToCart2', function (req, res) {

    var productId = req.body.productId;
    var quan = req.body.quantity;
   
    console.log('productId and quantity after add to cart2:');
    console.log(productId,quan);

     var url = 'http://localhost:3000/api/users/addToCart2';
   
      request.post(url,{
        json:{
          "productId":req.body.productId,
          "quantity":quan
        }
      },function(err,response,body){
        if(!err && response.statusCode==200){
          console.log('adding one product in cart is success');
         // body = JSON.parse(body);
         currentCart = body;
          console.log(body);
          //8.calculate cost
          var url2 = 'http://localhost:3000/api/users/checkout_Cost';
          request(url2, function (err, response,cost) {
          t_cost = cost;
          if(!err && response.statusCode == 200){
            console.log('cost calculation using /checkout_Cost api is success!',cnt);
            console.log('total cost:',body);
            res.render('cart', {
              userId:userId,
              prods: prods,
              cartProds:currentCart,
              cost:t_cost
            });
          }
          });
         
        }
      })
      //render view to second page
     


  });

  // 1.signup
  router.get('/cart', function (req, res) {
    res.render('cart', {
      userId:userId,
      cartProds: currentCart,
      prods:prods,
      cost:t_cost

    });
    //res.redirect('/');

  });
  router.get('/tracking', function (req, res) {
    res.render('orderTracking', {
          track:orderTrack
    });
    //res.redirect('/');

  });
  router.get('/confirm', function (req, res) {
    res.render('confirmation', {

    });
    //res.redirect('/');

  });
  router.get('/loginPage', function (req, res) {
    res.render('login', {

    });
    //res.redirect('/');

  });
  router.get('/profile', function (req, res) {
    console.log('userId of get profile',userId);
    var url = 'http://localhost:3000/api/users/'+userId;
      request(url,function(err,response,body){
        if(!err && response.statusCode==200){
          
          profileInfo = JSON.parse(body);
          console.log(profileInfo);
          res.render('profile', {
            userId:userId,
            profInfo: profileInfo 
          });
        }
      })
  });
  router.post('/editProfile', function (req, res) {

     var id = req.body.userId;
     //console.log(typeof email);
      if(id==undefined){
        console.log('please login first to see profile..');
        res.render('profile', {
         });

      }
      else{
    var  url = 'http://localhost:3000/api/users/'+id+'/replace';
    //http://localhost:3000/api/users/5d22caeb10409c17dd3966b6/replace
   
    console.log(req.body);
    request.post(url,{
      json:{
        "email":req.body.email,
        "ac_holder": req.body.ac_holder,
        "ac_no": req.body.ac_no,
        "phn": req.body.phn,
        "secret": req.body.secret,
        "password": req.body.password
      }
    },function(err,response,body){
        if(!err && response.statusCode==200){
          console.log('edit profile is success!!',body);
          //profileInfo = JSON.parse(body);
          res.render('index', {
            userId:userId,
            prods:prods
            
           });
        }
        else if(err){
          console.log.log('edit profile is not success.');
        }
    });
  }
   
    //res.redirect('/');

  });
  router.get('/register', function (req, res) {
    res.render('register', {

    });
    //res.redirect('/');

  });
  router.get('/addAccount', function (req, res) {
    res.render('addAccount', {

    });
    //res.redirect('/');

  });
  router.get('/confirm', function (req, res) {
    res.render('confirmation', {

    });
    //res.redirect('/');

  });
  router.get('/signup', function (req, res) {
    res.render('addAccount');
  });
  router.post('/signup', function (req, res) {
    console.log('\r');

    var User = app.models.user;

    var email = req.body.email;
    var password = req.body.password;

    //1.signup a user through post/users api
    var url = 'http://localhost:3000/api/users';
    request.post(url, {
        json: {
          email: email,
          password: password
        }
      },
      function (error, response, postData) {
        if (!error && response.statusCode == 200) {

          console.log('Signup has been done using /post/users api...');

          //2.now login a user
          User.login({
            email: email,
            password: password
          }, 'user', function (err, token) {
            if (err)
              return res.render('index', {
                email: email,
                password: password,
                loginFailed: true
              });
            console.log('login is also success..');
            token = token.toJSON();
            userId= token.userId;
            // 3.first time take account Info
            //4.view supplied products of supplier

            var url = 'http://localhost:8000/api/products';
            request(url, function (err, response, body) {
              prods = JSON.parse(body); //console.log(prods);

              //render view to second page
              res.render('addAccount', {
                accessToken: token.id,
                userId: token.userId,
                prods: prods,
                isSignup: true
              });

            });

          });;
        }
      }
    );



  });





  // 2.only login
  router.get('/login', function (req, res) {
    res.render('homepage');
  });
  router.post('/login', function (req, res) {

    var email = req.body.email;
    var password = req.body.password;
     console.log(email,password);
    var User = app.models.user;
    User.login({
      email: email,
      password: password
    }, 'user', function (err, token) {
      if (err){
        console.log('login is not succcess! User does not exist!');
        return res.render('index', {
          email: email,
          password: password,
          loginFailed: true
        });
      };
      console.log('login is success!');
      token = token.toJSON();
      userId = token.userId;

      //4.view supplied products of supplier
      var url = 'http://localhost:8000/api/products';

      request(url, function (err, response, body) {
        //console.log('body of view Products'+body);
        prods = JSON.parse(body);
        console.log(prods);
        //render view to second page
        res.render('product', {
          accessToken: token.id,
          userId: token.userId,
          prods: prods

        });

      });


    });
  });






  // 3.logout
  router.get('/logout', function (req, res) {
    var AccessToken = app.models.AccessToken;
    var token = new AccessToken({
      id: req.query['access_token']
    });
    console.log('token id:',token.id);
    token.destroy();

    res.redirect('/');
  });

///moveToCartPage
  router.get('/moveToCartPage',function(req,res){
    res.render('cart',{
      userId:userId,
      cartProducts: currentCart,
      prods: prods,
      cost: t_cost
    });
  })



  //4.add to cart
  router.get('/addToCart', function (req, res) {
    res.render('cart',{
      userId:userId,
      cartProds: currentCart,
      prods:prods,
      cost:t_cost
    });
  });
  var cnt=0;
  router.post('/addToCart', function (req, res) {
    console.log('\r');
    
    var url = 'http://localhost:3000/api/users/addToCart';

     cnt++;
    var quan = Number(req.body.quantity);
    console.log('after post /addToCart api',req.body.productId);
    console.log(quan);
    // console.log(quan);
    request.post(url, {
        json: {
          productId: req.body.productId,
          quantity: quan
        }
      },
      function (error, response, postData) {
        if (!error && response.statusCode == 200) {
           console.log('Adding product to cart using /addToCart api is succes!',cnt);

          //7.get All cart Products and

          var url = 'http://localhost:3000/api/users/showCartProducts';
          request(url, function (err, response, bodyProds) {

            if(!err && response.statusCode == 200){
            currentCart = JSON.parse(bodyProds);
              console.log('showing current cart products using /showCartProducts api is success!',cnt);
              //console.log(currentCart);
            //8.calculate cost
              var url2 = 'http://localhost:3000/api/users/checkout_Cost';
              request(url2, function (err, response,cost) {
              //console.log(body);
              t_cost = cost;
              if(!err && response.statusCode == 200){
                console.log('cost calculation using /checkout_Cost api is success!',cnt);
               // console.log('total cost:',body);
                res.render('cart', {
                  userId:userId,
                  cartProds: currentCart,
                  prods: prods,
                  cost: t_cost
                });
             }

              }
            );
          }
        }
          )

        }
      }
    );
  });



  //5.remove from cart
  router.get('/removeFromCart', function (req, res) {
    res.render('cart',{
      userId:userId,
      cartProds:currentCart,
      prods:prods,
      cost:t_cost
    });
  });
  var cnt2=0;
  router.post('/removeFromCart', function (req, res) {
    console.log('\r');
    cnt2++;
    var url = 'http://localhost:3000/api/users/removeFromCart';


    var quan = req.body.quantity;
    var quan = Number(req.body.quantity);
    request.post(url, {
        json: {
          productId: req.body.productId,
          quantity: quan
        }
      },
      function (error, response, postData) {
        if (!error && response.statusCode == 200) {

           console.log('Removing product from cart using /removeFromCart api is success!',cnt2);
          //7.get All recent cart Products and

          var url = 'http://localhost:3000/api/users/showCartProducts';
          request(url, function (err, response, bodyProds) {
            currentCart = JSON.parse(bodyProds);
            console.log('showing current cart products after removing product is success!',cnt2);
            //8.calculate cost
            var url2 = 'http://localhost:3000/api/users/checkout_Cost';
            request(url2, function (err, response, cost) {
              //console.log(body);
              console.log('cost calculation after removing product is success!',cnt2);
              t_cost=cost;
              res.render('cart', {
                userId:userId,
                cartProds: currentCart,
                prods: prods,
                cost: t_cost
              });
            });
          });



        }

      }
    );
  });



  router.get('/addAccountInfo', function (req, res) {
    res.render('product');
  });
  //6.add accountOnfo
  router.post('/addAccountInfo', function (req, res) {
    console.log('\r');
    var url = 'http://localhost:3000/api/users/Account_info';

    var userId = req.body.userId;
    request.post(url, {
        json: {
          userId: userId,
          ac_holder: req.body.ac_holder,
          ac_no: req.body.ac_no,
          phn: req.body.phn,
          secret: req.body.secret
        }
      },
      function (error, response, postData) {
        if (!error && response.statusCode == 200) {
          console.log('Adding accountInfo using /Account_info is success!!');
          //console.log(postData);
          res.render('product',{
             userId :userId,
             prods: prods,
             isSignup:false
          });
        }
      
      }
    );
  });


  router.post('/placeOrder',function(req,res){
       console.log('\r');

       var userId  = req.body.userId;
       var t_cost = req.body.t_cost;

       console.log(userId,t_cost);
       var url='http://localhost:3000/api/users/placeOrder';
       request.post(url,{
         json:{
            userId:userId,
            t_cost:t_cost
         }
       },function(err,response,body){
          if(!err && response.statusCode == 200){
            console.log('order placing is scuccess!!');
            console.log(body);
            orderTrack = body;
            res.render('orderTracking',{
              track: orderTrack
           });
          }
       })

  });
  app.use(router);
}
