/// <reference path="/home/jan-hybs/typings/globals/nunjucks/nunjucks.d.ts"/>

class Globals {
  static env: nunjucks.Environment;

  static initEnv() {
    var URL = `${location.protocol}//${document.domain}:${location.port}`;
    this.env = nunjucks.configure(URL, {
      autoescape: true
    });
    this.env.addFilter('toFixed', (num, digits) => {
      return parseFloat(num).toFixed(digits || 2)
    });
    this.env.addFilter('pad', (n: number, w: number=2, z: string='0') => {
      let m = n.toString();
      return m.length >= w ? m : new Array(w - m.length + 1).join(z) + m;
    });
    this.env.addFilter('cut', (str, digits) => {
      return str.substring(0, digits || 8)
    });
    this.env.addGlobal('inArray', function(value, arr) {
      return arr.includes(value);
    });
    this.env.addFilter('toFixed', function(num, digits) {
      return parseFloat(num).toFixed(digits)
    });
  }
}

class Templates {
  static listQueueItems: nunjucks.Template;
  static listQueueItem: nunjucks.Template;
  static processExecute: nunjucks.Template;
  static testResult2: nunjucks.Template;
  static fatalError: nunjucks.Template;
  static testTitle: nunjucks.Template;
  static testDetails: nunjucks.Template;
  static testScore: nunjucks.Template;
  static testAttachments: nunjucks.Template;

  static loadTemplates() {
    var compileNow: boolean = true;
    this.listQueueItems = Globals.env.getTemplate("static/templates/list-queue-items.njk", compileNow);
    this.listQueueItem = Globals.env.getTemplate("static/templates/list-queue-item.njk", compileNow);
    this.processExecute = Globals.env.getTemplate("static/templates/process-execute.njk", compileNow);
    this.testResult2 = Globals.env.getTemplate("static/templates/test-result2.njk", compileNow);
    this.fatalError = Globals.env.getTemplate("static/templates/fatal-error.njk", compileNow);
    this.testTitle = Globals.env.getTemplate("static/templates/test-title.njk", compileNow);
    this.testDetails = Globals.env.getTemplate("static/templates/test-details.njk", compileNow);
    this.testScore = Globals.env.getTemplate("static/templates/test-score.njk", compileNow);
    this.testAttachments = Globals.env.getTemplate("static/templates/test-attachments.njk", compileNow);
  }
}
