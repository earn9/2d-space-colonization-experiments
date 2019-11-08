import Defaults from './Defaults';

export default class AuxinSource {
  constructor(position, ctx, settings = {}) {
    this.position = position;
    this.ctx = ctx;
    this.settings = Object.assign({}, Defaults, settings);

    this.isInfluencing = [];
  }

  draw() {
    // Draw the attraction zone
    if(this.settings.ShowAttractionZones) {
      this.ctx.beginPath();
      this.ctx.ellipse(this.position.x, this.position.y, this.settings.AttractionDistance, this.settings.AttractionDistance, 0, 0, Math.PI * 2);
      this.ctx.globalAlpha = .02;
      this.ctx.fillStyle = '#f00';
      this.ctx.fill();
    }

    // Draw the auxin source
    this.ctx.beginPath();
    this.ctx.ellipse(this.position.x, this.position.y, this.settings.AuxinRadius, this.settings.AuxinRadius, 0, 0, Math.PI * 2);
    this.ctx.globalAlpha = .2;
    this.ctx.fillStyle = '#000';
    this.ctx.fill();

    this.ctx.globalAlpha = 1;
  }
}