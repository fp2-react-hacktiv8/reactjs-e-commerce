import { Image, Box, Button, Icon, useToast } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/layout";
import { StarIcon } from "@chakra-ui/icons";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import OtherProducts from "../components/OtherProducts";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ADD_CART_ITEMS, ADD_COUNT_ITEM } from "../store/sliecrs/cart";
import { isAuthenticated, isAdmin } from "../libs/helpers/auth";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { UPDATE_ITEM_STOCK } from "../store/sliecrs/products";

const DetailProduct = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const params = useParams();
  const allProducts = useSelector((state) =>
    state.products.products.length > 0
      ? state.products.products
      : JSON.parse(localStorage.getItem("allProducts"))
  );
  const cartProducts = useSelector((state) =>
    state.cartItems.cartItems.length > 0
      ? state.cartItems.cartItems
      : JSON.parse(localStorage.getItem("cartItems"))
  );
  const [product, setProduct] = useState(null);

  const [count, setCount] = useState(0);

  const handleSubtract = () => {
    if (count >= 1) {
      setCount(count - 1);
    }
  };

  const handleAdd = () => {
    setCount(count + 1);
  };

  const handleAddToCart = () => {
    if (isAdmin()) {
      toast({
        title: "Admin cannot add products to the cart.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }
    if (isAuthenticated()) {
      const selectedItem = { ...product, count };
      const sameItemInCart =
        cartProducts &&
        cartProducts.find((item) => item.id === selectedItem.id);
      if (sameItemInCart) {
        dispatch(ADD_COUNT_ITEM({ id: selectedItem.id, count }));
      } else {
        dispatch(ADD_CART_ITEMS(selectedItem));
      }
      dispatch(
        UPDATE_ITEM_STOCK({
          id: selectedItem.id,
          stock: product.stock - selectedItem.count,
        })
      );
      setCount(0);
      toast({
        title: "Success add this product.",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }
    return (window.location.href = "/login");
  };

  useEffect(() => {
    const testProduct = async () => {
      const detailProduct = await allProducts.find(
        (item) => item.id === parseInt(params.id)
      );
      setProduct(detailProduct);
    };
    testProduct();
  }, [allProducts, count, params.id]);

  return (
    <div className="w-full p-2 md:p-8 lg:p-8 xl:p-8 space-y-8 md:space-y-16 lg:space-y-16 xl:space-y-16 max-w-full">
      {product && (
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-5 md:space-y-0 lg:space-y-0 xl:space-y-0 md:space-x-10 lg:space-x-10 xl:space-x-10 justify-center">
          <Box maxW="xs">
            <Image
              src={product.image}
              alt="product"
              align={"center"}
              w={"100%"}
            />
          </Box>
          <Box maxW="sm">
            <h1 className="text-2xl font-semibold">{product.title}</h1>
            <Box display="flex" alignItems="center">
              {product.rating &&
                Array(5)
                  .fill("")
                  .map((_, i) => (
                    <StarIcon
                      key={i}
                      color={
                        i < product.rating.rate ? "orange.300" : "gray.300"
                      }
                    />
                  ))}
              <Box as="span" ml="2" color="gray.600" fontSize="sm">
                from {product.rating && product.rating.count} reviews
              </Box>
            </Box>
            <div className="flex flex-row items-center justify-between">
              <h1 className="font-bold text-xl my-5">$ {product.price}</h1>
              <h1
                className={`font-bold text-xl my-5 ${
                  product.stock - count < 5 && "text-red-500"
                }`}
              >
                Stock : {product.stock - count}
              </h1>
            </div>
            <div className="w-full border-b border-gray-400" />
            <p className="my-3">{product.description}</p>
            <div className="w-full border-b border-gray-400" />
            <Stack
              direction="row"
              mt="5"
              spacing={4}
              align="center"
              className="justify-between"
              w="full"
            >
              <Button
                isDisabled={count === 0}
                bg="red.200"
                className="shadow-lg"
                onClick={handleSubtract}
              >
                <HiOutlineMinus />
              </Button>
              <p className="text-xl font-bold">{count}</p>
              <Button
                isDisabled={product.stock - count === 0}
                bg="orange.200"
                className="shadow-lg"
                onClick={handleAdd}
              >
                <HiPlus />
              </Button>
            </Stack>
            <Button
              bg="orange.300"
              className="shadow-lg"
              variant="solid"
              mt="5"
              w="full"
              disabled={!isAuthenticated() || count === 0}
              onClick={handleAddToCart}
            >
              <Icon as={AiOutlineShoppingCart} w="20px" h="20px" mx="5" />
              {isAuthenticated() ? "Add to Cart" : "Login to Add to Cart"}
            </Button>
          </Box>
        </div>
      )}
      <OtherProducts />
    </div>
  );
};

export default DetailProduct;
