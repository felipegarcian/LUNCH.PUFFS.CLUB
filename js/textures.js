// Dynamic Texture and Particle Art Generator for Next-Level Visuals
var TextureGenerator = {
    generated: false,
    
    init: function(game) {
        if (this.generated) return;
        this.generated = true;

        // 1. Cheese Wedge Pickup (for Rat)
        var cheeseBmd = game.add.bitmapData(32, 28);
        var ctx = cheeseBmd.ctx;
        ctx.fillStyle = "#FFB300";
        ctx.beginPath();
        ctx.moveTo(4, 24);
        ctx.lineTo(28, 24);
        ctx.lineTo(28, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#FFD54F";
        ctx.beginPath();
        ctx.moveTo(4, 24);
        ctx.lineTo(20, 24);
        ctx.lineTo(28, 12);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();

        // Holes
        ctx.fillStyle = "#FFA000";
        ctx.beginPath(); ctx.arc(18, 20, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(24, 16, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(22, 9, 2, 0, Math.PI * 2); ctx.fill();

        cheeseBmd.generateTexture('snack_cheese');

        // 2. French Fry / Breadcrumb (for Pigeon)
        var crumbBmd = game.add.bitmapData(26, 26);
        ctx = crumbBmd.ctx;
        ctx.fillStyle = "#FFC107";
        ctx.fillRect(8, 2, 10, 22);
        ctx.fillStyle = "#FFE082";
        ctx.fillRect(10, 4, 4, 18);
        ctx.fillStyle = "#FFA000";
        ctx.fillRect(8, 20, 10, 4);
        crumbBmd.generateTexture('snack_fry');

        // 3. Power Puff Orb (Mega boost power-up)
        var puffBmd = game.add.bitmapData(36, 36);
        ctx = puffBmd.ctx;
        var grad = ctx.createRadialGradient(18, 18, 3, 18, 18, 16);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, '#00FFFF');
        grad.addColorStop(0.8, '#FF00FF');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(18, 18, 16, 0, Math.PI * 2);
        ctx.fill();
        puffBmd.generateTexture('power_puff');

        // 4. Heart Pickup (Red Heart)
        var heartBmd = game.add.bitmapData(28, 28);
        ctx = heartBmd.ctx;
        ctx.fillStyle = "#FF1744";
        ctx.beginPath();
        ctx.moveTo(14, 24);
        ctx.bezierCurveTo(4, 16, 2, 6, 8, 4);
        ctx.bezierCurveTo(12, 3, 14, 8, 14, 8);
        ctx.bezierCurveTo(14, 8, 16, 3, 20, 4);
        ctx.bezierCurveTo(26, 6, 24, 16, 14, 24);
        ctx.fill();
        // Highlight
        ctx.fillStyle = "#FF8A80";
        ctx.beginPath();
        ctx.arc(9, 8, 2.5, 0, Math.PI * 2);
        ctx.fill();
        heartBmd.generateTexture('pickup_heart');

        // 5. Golden Shield Glow Bubble
        var shieldBmd = game.add.bitmapData(72, 72);
        ctx = shieldBmd.ctx;
        var shieldGrad = ctx.createRadialGradient(36, 36, 20, 36, 36, 34);
        shieldGrad.addColorStop(0, 'rgba(255, 235, 59, 0.1)');
        shieldGrad.addColorStop(0.8, 'rgba(255, 215, 0, 0.6)');
        shieldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(36, 36, 33, 0, Math.PI * 2);
        ctx.fill();
        shieldBmd.generateTexture('shield_bubble');

        // 6. Sparkle / Fire Particle
        var sparkBmd = game.add.bitmapData(12, 12);
        ctx = sparkBmd.ctx;
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(4, 0, 4, 12);
        ctx.fillRect(0, 4, 12, 4);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(4, 4, 4, 4);
        sparkBmd.generateTexture('spark_particle');

        // 7. Feather Particle (for Pigeon)
        var featherBmd = game.add.bitmapData(16, 8);
        ctx = featherBmd.ctx;
        ctx.fillStyle = "#E0E0E0";
        ctx.beginPath();
        ctx.ellipse(8, 4, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#BDBDBD";
        ctx.fillRect(4, 3, 8, 2);
        featherBmd.generateTexture('feather_particle');

        // 8. Sonic Gust Shockwave
        var sonicBmd = game.add.bitmapData(80, 80);
        ctx = sonicBmd.ctx;
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(40, 40, 32, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(40, 40, 36, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        sonicBmd.generateTexture('sonic_gust');

        // 9. Hugo's Bucket of Fish Heads (Iconic Simpsons Attic Food)
        var fishBmd = game.add.bitmapData(34, 34);
        ctx = fishBmd.ctx;
        // Bucket
        ctx.fillStyle = "#78909C";
        ctx.fillRect(8, 14, 18, 16);
        ctx.fillStyle = "#546E7A";
        ctx.fillRect(6, 12, 22, 4);
        // Fish Head sticking out
        ctx.fillStyle = "#26A69A";
        ctx.beginPath();
        ctx.moveTo(17, 2);
        ctx.lineTo(26, 12);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        // Fish Eye
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath(); ctx.arc(16, 7, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath(); ctx.arc(16, 7, 1.5, 0, Math.PI*2); ctx.fill();
        // Fish mouth
        ctx.strokeStyle = "#004D40";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(17, 2); ctx.lineTo(13, 6); ctx.stroke();
        fishBmd.generateTexture('snack_fish_head');

        // 10. Hugo's Surgical Needles & Thread (Hugo's stitching practice)
        var needleBmd = game.add.bitmapData(30, 30);
        ctx = needleBmd.ctx;
        // Needle
        ctx.strokeStyle = "#E0E0E0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(4, 26);
        ctx.lineTo(24, 6);
        ctx.stroke();
        // Needle tip & eye
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(23, 5, 3, 3);
        // Red Surgical Thread trail
        ctx.strokeStyle = "#E91E63";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(5, 25);
        ctx.bezierCurveTo(2, 20, 8, 14, 2, 8);
        ctx.stroke();
        needleBmd.generateTexture('pickup_needle');
    }
};
