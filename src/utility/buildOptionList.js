const buildOptionList = function buildOptionList(options, group) {
  return options.filter((def) => {
    return def.group === group;
  });
};

module.exports = buildOptionList;