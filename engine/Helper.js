const time_utils = require("./utils/time_utils");
class Helper {
  constructor(app) {
    console.log("helper initialized");
    this.app = app;
  }
  pretty_time(time, smallest, digits) {
    const isNumber = /^[0-9]+$/.test(time);
    if (!isNumber && !Array.isArray(time)) {
      throw new TypeError("expected an array or number in nanoseconds");
    }
    if (Array.isArray(time) && time.length !== 2) {
      throw new TypeError("expected an array from process.hrtime()");
    }

    if (/^[0-9]+$/.test(smallest)) {
      digits = smallest;
      smallest = null;
    }

    let num = isNumber ? time : time_utils.nano(time);
    let res = "";
    let prev;

    for (const uom of Object.keys(time_utils.scale)) {
      const step = time_utils.scale[uom];
      let inc = num / step;

      if (smallest && time_utils.isSmallest(uom, smallest)) {
        inc = time_utils.round(inc, digits);
        if (prev && inc === prev / step) --inc;
        res += inc + time_utils.mapping[uom];
        return res.trim();
      }

      if (inc < 1) continue;
      if (!smallest) {
        inc = time_utils.round(inc, digits);
        res += inc + time_utils.mapping[uom];
        return res;
      }

      prev = step;

      inc = Math.floor(inc);
      num -= inc * step;
      res += inc + time_utils.mapping[uom] + " ";
    }

    return res.trim();
  }

  random_id(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (res) => {
        resolve(res.target.result);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  toHexString(byteArray) {
    return Array.prototype.map
      .call(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      })
      .join("");
  }

  toByteArray(hexString) {
    var result = [];
    for (var i = 0; i < hexString.length; i += 2) {
      result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
  }

  async blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", (e) => {
        resolve(reader.result);
      });
      reader.addEventListener("error", reject);
      reader.readAsArrayBuffer(blob);
    });
  }

  arrayBufferToBlob(buffer, type) {
    return new Blob([buffer], { type: type });
  }

  humanFileSize(bytes, si = true) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + " B";
    }
    var units = si
      ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
      : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
  }

  camelActual(str) {
    return (str || "").replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
  }
  humanize(str) {
    let ret = (str || "").replace(/-(\w)/g, (_, c) =>
      c ? " " + c.toUpperCase() : ""
    );
    return ret.charAt(0).toUpperCase() + ret.slice(1);
  }
  kebab(str) {
    return (str || "").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  dashLower(str) {
    return (str || "").replace(/\s+/g, "-").toLowerCase();
  }
  randomString(length = 5) {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  randomElement(arr = []) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  b64EncodeUnicode(str) {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }

  b64DecodeUnicode(str) {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }

  createUniqueName(name) {
    let suffix = this.randomString(6);
    let prefix = "project";
    let nname = this.dashLower(name).replace(/[^a-zA-Z0-9 ]/g, "");
    return `${prefix}-${nname}-${suffix}`;
  }
  download(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  downloadBlob(filename, data) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    let url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  upload(contentType) {
    return new Promise((resolve, reject) => {
      let input = document.createElement("input");
      input.type = "file";
      input.accept = contentType || "";

      input.onchange = (e) => {
        let file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (content) => {
          resolve(content.target.result);
        };
        reader.onerror = (err) => {
          reject(err);
        };
      };
      input.onerror = (err) => {
        reject(err);
      };
      input.click();
    });
  }
  getColorIndex(ind) {
    let colors = [
      "#3D642D",
      "#CF3476",
      "#FAD201",
      "#633A34",
      "#606E8C",
      "#826C34",
      "#063971",
      "#316650",
      "#FFA420",
      "#015D52",
      "#EA899A",
      "#7FB5B5",
      "#AEA04B",
      "#6C4675",
      "#C2B078",
      "#587246",
      "#45322E",
    ];
    //return colors[(Math.random() * colors.length) | 0];
    if (ind >= colors.length) {
      ind = 0;
    }
    return colors[ind];
  }
  addAlpha(color, opacity) {
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  concatenateArrayBuffers(buffers) {
    if (buffers.length === 1) {
      return buffers[0];
    }
    var totalByteLength = 0;
    buffers.forEach(function (buffer) {
      totalByteLength += buffer.byteLength;
    });
    var temp = new Uint8Array(totalByteLength);
    var offset = 0;
    buffers.forEach(function (buffer) {
      temp.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
    return temp.buffer;
  }
}
export default ({ app }, inject) => {
  const helper = new Helper(app);
  inject("helper", helper);
};
