export const randomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    for (let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export const calculateSimilarity = (s1 : string, s2 : string, normalizeCzech : boolean = true) => {
    if(normalizeCzech){
        s1 = normalizeCzechString(s1);
        s2 = normalizeCzechString(s2);
    }

    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / longerLength;
  }

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

export const normalizeCzechString = (text: string) => {
    const mapovani = {
        'á': 'a',
        'č': 'c',
        'ď': 'd',
        'é': 'e',
        'ě': 'e',
        'í': 'i',
        'ň': 'n',
        'ó': 'o',
        'ř': 'r',
        'š': 's',
        'ť': 't',
        'ú': 'u',
        'ů': 'u',
        'ý': 'y',
        'ž': 'z',
        'Á': 'A',
        'Č': 'C',
        'Ď': 'D',
        'É': 'E',
        'Ě': 'E',
        'Í': 'I',
        'Ň': 'N',
        'Ó': 'O',
        'Ř': 'R',
        'Š': 'S',
        'Ť': 'T',
        'Ú': 'U',
        'Ů': 'U',
        'Ý': 'Y',
        'Ž': 'Z'
    };

    for (var znak in mapovani) {
        var regex = new RegExp(znak, "g");
        text = text.replace(regex, mapovani[znak]);
    }

    return text;
}