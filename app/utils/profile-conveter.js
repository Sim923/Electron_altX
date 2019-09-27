const converter = require("./converter");

const profile_converter = (src_path, dst_path, src_format, dst_format) => {
  converter.convert(src_path, dst_path, src_format, dst_format);
};

export default profile_converter;
