var tipoMuro = 2;
var tipoBloque = 3;
var tipoObjetivo = 4;
var tipoBola = 5;

var GameLayer = cc.Layer.extend({
    mundoActivo: false,
    space:null,
    spritePelota:null,
    arrayBloques:[],
    formasEliminar: [],
    spriteFondo: null,
    tiempo:0,
    intentos:3,
    arrayObjetivo:[],
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);

        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        // Muros
        var muroIzquierdaShape = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(0, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroIzquierdaShape);

        var muroArribaShape = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, size.height),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroArribaShape);

        var muroDerechaShape = new cp.SegmentShape(this.space.staticBody,
            cp.v(size.width, 0),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro
        this.space.addStaticShape(muroDerechaShape);

        var muroAbajoShape = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(size.width, 0),// Punto final
            10);// Ancho del muro
            muroAbajoShape.setFriction(1);
            muroAbajoShape.setCollisionType(tipoMuro);
        this.space.addStaticShape(muroAbajoShape);

        // muro y bloque
        this.space.addCollisionHandler(tipoMuro, tipoBloque,
                         null, null, this.collisionBloqueConMuro.bind(this), null);
        // pelota y objetivo
        this.space.addCollisionHandler(tipoObjetivo, tipoBola,
                                 null, null, this.collisionBolaConObjetivo.bind(this), null);
        // pelota y bloque
        this.space.addCollisionHandler(tipoBloque, tipoBola,
                                 null, null, this.collisionBolaConBloque.bind(this), null);
        // muro y objetivo
        this.space.addCollisionHandler(tipoMuro, tipoObjetivo,
                                 null, null, this.collisionObjetivoConMuro.bind(this), null);
        // bloque y objetivo
        this.space.addCollisionHandler(tipoObjetivo, tipoBloque,
                                 null, null, this.collisionBloqueConObjetivo.bind(this), null);



        // Fondo
        this.spriteFondo = cc.Sprite.create(res.fondo_png);
        this.spriteFondo.setPosition(cc.p(size.width/2 , size.height/2));
        this.spriteFondo.setScale( size.width / this.spriteFondo.width );
        this.addChild(this.spriteFondo);

        // cache
        cc.spriteFrameCache.addSpriteFrames(res.animacion_bola_plist);
        cc.spriteFrameCache.addSpriteFrames(res.barra_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);

        // Sprite pelota
        this.spritePelota = new cc.PhysicsSprite("#animacion_bola1.png");

        var body = new cp.Body(1, cp.momentForCircle(1,0,this.spritePelota.width/2, cp.vzero));

        body.p = cc.p(size.width*0.1 , size.height*0.5);

        this.spritePelota.setBody(body);
        //Agregar el body al spacio sino no funciona
        this.space.addBody(body);

        var shape = new cp.CircleShape(body, this.spritePelota.width/2, cp.vzero);
        shape.setCollisionType(tipoBola);
        this.space.addShape(shape);
        this.addChild(this.spritePelota);


        // Evento MOUSE
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this);

        this.inicializarPlataformas();
        this.inicializarBloques();

        this.scheduleUpdate();
        return true;

    },procesarMouseDown:function(event) {
             // Ambito procesarMouseDown
             var instancia = event.getCurrentTarget();
              if(instancia.tiempo == 0 ){
                 instancia.mundoActivo = true;
                 instancia.tiempo = new Date().getTime();

                  var body = instancia.spritePelota.body;
                  body.applyImpulse(cp.v( event.getLocationX() - body.p.x, event.getLocationY() - body.p.y), cp.v(0,0));
                  instancia.intentos--;
              }
              else if(instancia.tiempo > 0 && instancia.intentos>0){
                instancia.mundoActivo = false;
                instancia.spritePelota.setPosition(cc.p(cc.winSize.width*0.1 , cc.winSize.height*0.5));
                instancia.tiempo = 0;
              }

     },update:function (dt) {

        if(this.mundoActivo){
               this.space.step(dt);
           }

        for(var i = 0; i < this.formasEliminar.length; i++) {
                var shape = this.formasEliminar[i];

                for (var i = 0; i < this.arrayBloques.length; i++) {
                  if (this.arrayBloques[i].body.shapeList[0] == shape) {
                      // quita la forma
                      this.space.removeShape(shape);
                      // quita el cuerpo *opcional, funciona igual
                      this.space.removeBody(shape.getBody());
                      // quita el sprite
                      this.arrayBloques[i].removeFromParent();
                      // Borrar tambien de ArrayBloques
                      this.arrayBloques.splice(i, 1);
                  }
                }
                for (var i = 0; i < this.arrayObjetivo.length; i++) {
                  if (this.arrayObjetivo[i].body.shapeList[0] == shape) {
                      // quita la forma
                      this.space.removeShape(shape);
                      // quita el cuerpo *opcional, funciona igual
                      this.space.removeBody(shape.getBody());
                      // quita el sprite
                      this.arrayObjetivo[i].removeFromParent();
                      // Borrar tambien de ArrayBloques
                      this.arrayObjetivo.splice(i, 1);
                  }

                }
            }
            this.formasEliminar = [];

        if( this.arrayObjetivo.length > 0){

            var todosSinMoverse = true;
            for(var i = 0; i < this.arrayBloques.length; i++) {
                var velocidadBloque = this.arrayBloques[i].body.getVel();
                if( velocidadBloque.x < -0.09 && velocidadBloque.x > 0.09 ){
                    // NO - ESTE SE MUEVE
                    todosSinMoverse = false;
                }
            }
            if ( this.tiempo != 0 && (new Date().getTime() - this.tiempo) > 10000 && todosSinMoverse ){
                cc.director.pause();
                cc.audioEngine.stopMusic();
                this.getParent().addChild(new GameOverLayer());
            }

        } else { //  arrayBloques.length == 0
            cc.director.pause();
            cc.audioEngine.stopMusic();
            this.getParent().addChild(new GameWinLayer());
        }


     },inicializarPlataformas:function () {

                     var spritePlataforma = new cc.PhysicsSprite("#barra_3.png");

                     var body = new cp.StaticBody();
                     body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4);
                     spritePlataforma.setBody(body);
                      // Los cuerpos estáticos no se añaden al espacio
                     //this.space.addBody(body);

                     var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
                     // addStaticShape en lugar de addShape
                     shape.setFriction(1);
                     this.space.addStaticShape(shape);

                     this.addChild(spritePlataforma);

     },inicializarBloques:function () {
                    var altoTorre = 0;

                    while(altoTorre < 4){
                        var modelo = Math.floor((Math.random() * 2) + 1);
                        if(modelo==1)
                         var spriteBloque = new cc.PhysicsSprite("#cocodrilo1.png");
                        if(modelo==2)
                         var spriteBloque = new cc.PhysicsSprite("#panda1.png");

                         // Masa 1
                         var body = new cp.Body(1, cp.momentForBox(1, spriteBloque.width, spriteBloque.height));

                         body.p = cc.p(cc.winSize.width*0.7 , cc.winSize.height*0.4 + 10 + 20 + spriteBloque.height*altoTorre);

                         spriteBloque.setBody(body);
                         // Este si hay que añadirlo
                         this.space.addBody(body);

                         var shape = new cp.BoxShape(body, spriteBloque.width, spriteBloque.height);
                         shape.setFriction(1);
                         if(modelo==1)
                            shape.setCollisionType(tipoBloque);
                         if(modelo==2)
                            shape.setCollisionType(tipoObjetivo);
                         this.space.addShape(shape);
                         this.addChild(spriteBloque);

                         // agregar el Sprite al array Bloques
                         if(modelo==1)
                            this.arrayBloques.push(spriteBloque);
                         if(modelo==2)
                            this.arrayObjetivo.push(spriteBloque);

                         altoTorre++;

                   }

        },collisionBloqueConMuro:function (arbiter, space) {
            var shapes = arbiter.getShapes();
            this.formasEliminar.push(shapes[1]);
        },collisionBolaConObjetivo:function (arbiter, space) {
             var shapes = arbiter.getShapes();
             if(this.spritePelota.body.vx>100)
                this.formasEliminar.push(shapes[0]);
        },collisionBolaConBloque:function (arbiter, space) {
             var shapes = arbiter.getShapes();
              if(this.spritePelota.body.vx>250)
                 this.formasEliminar.push(shapes[0]);
        },collisionObjetivoConMuro:function (arbiter, space) {
              var shapes = arbiter.getShapes();
              this.formasEliminar.push(shapes[1]);
        },collisionBloqueConObjetivo:function (arbiter, space) {
               var shapes = arbiter.getShapes();
               var body = arbiter.body_b;
               if(body.vx > 100 || body.vy<-50){
                this.formasEliminar.push(shapes[1]);
                this.formasEliminar.push(shapes[0]);
               }
        }



});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

