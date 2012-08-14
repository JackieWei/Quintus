Quintus.Sprites = function(Q) {
 
  // Create a new sprite sheet
  // Options:
  //  tilew - tile width
  //  tileh - tile height
  //  w     - width of the sprite block
  //  h     - height of the sprite block
  //  sx    - start x
  //  sy    - start y
  //  cols  - number of columns per row
  Q.Class.extend("SpriteSheet",{
    init: function(name, asset,options) {
      _.extend(this,{
        name: name,
        asset: asset,
        w: Q.asset(asset).width,
        h: Q.asset(asset).height,
        tilew: 64,
        tileh: 64,
        sx: 0,
        sy: 0
        },options);
      this.cols = this.cols || 
                  Math.floor(this.w / this.tilew);
    },

    fx: function(frame) {
      return Math.floor((frame % this.cols) * this.tilew + this.sx);
    },

    fy: function(frame) {
      return Math.floor(Math.floor(frame / this.cols) * this.tileh + this.sy);
    },

    draw: function(ctx, x, y, frame) {
      if(!ctx) { ctx = Q.ctx; }
      ctx.drawImage(Q.asset(this.asset),
                    this.fx(frame),this.fy(frame),
                    this.tilew, this.tileh,
                    Math.floor(x),Math.floor(y),
                    this.tilew, this.tileh);

    }

  });


  Q.sheets = {};
  Q.sheet = function(name,asset,options) {
    if(asset) {
      Q.sheets[name] = new Q.SpriteSheet(name,asset,options);
    } else {
      return Q.sheets[name];
    }
  };

  Q.compileSheets = function(imageAsset,spriteDataAsset) {
    var data = Q.asset(spriteDataAsset);
    _(data).each(function(spriteData,name) {
      Q.sheet(name,imageAsset,spriteData);
    });
  };


// Properties:
  //    x
  //    y
  //    z - sort order
  //    sheet or asset
  //    frame
  Q.GameObject.extend("Sprite",{
    init: function(props) {
      this.p = _({ 
        x: 0,
        y: 0,
        z: 0,
        frame: 0,
        type: 0
      }).extend(props||{});
      if((!this.p.w || !this.p.h)) {
        if(this.asset()) {
          this.p.w = this.p.w || this.asset().width;
          this.p.h = this.p.h || this.asset().height;
        } else if(this.sheet()) {
          this.p.w = this.p.w || this.sheet().tilew;
          this.p.h = this.p.h || this.sheet().tileh;
        }
      }
      this.p.cx = this.p.cx || (this.p.w / 2);
      this.p.cy = this.p.cy || (this.p.h / 2);
      this.p.id = this.p.id || _.uniqueId();
    },

    asset: function() {
      return Q.asset(this.p.asset);
    },

    sheet: function() {
      return Q.sheet(this.p.sheet);
    },

    draw: function(ctx) {
      var p = this.p;

      if(!ctx) { ctx = Q.ctx; }

      this.trigger('predraw',ctx);

      /* Only worry about context if we have an angle */
      if(p.angle) {
        ctx.save();

        ctx.translate(p.x,p.y);
        ctx.translate(p.cx,p.cy)
        ctx.rotate(p.angle * Math.PI / 180)
        ctx.translate(-p.cx, -p.cy);

        if(p.sheet) {
          this.sheet().draw(ctx,0,0,p.frame);
        } else if(p.asset) {
          ctx.drawImage(Q.asset(p.asset),0,0);
        }

        ctx.restore();
      } else {
        if(p.sheet) {
          this.sheet().draw(ctx, p.x, p.y, p.frame);
        } else if(p.asset) {
          ctx.drawImage(Q.asset(p.asset), 
                        Math.floor(p.x), 
                        Math.floor(p.y));
        }
      }
      this.trigger('draw',ctx);
    },

    step: function(dt) {
      this.trigger('step',dt);
    }
  });

  Q.Sprite.extend("MovingSprite",{
    init: function(props) {
      this._super(_({
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0
      }).extend(props));
   },

   step: function(dt) {
     var p = this.p;

     p.vx += p.ax * dt;
     p.vy += p.ay * dt;

     p.x += p.vx * dt;
     p.y += p.vy * dt;

     this._super(dt);
   }
 });




  return Q;
};

