import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ChatContext from "../Context/chat-context.js";
import ProfileModal from "./ProfileModal";
import { useDisclosure } from "@chakra-ui/hooks";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Button } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/tooltip";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { Input, Spinner } from "@chakra-ui/react";
import UserListItem from "./UserListItem.jsx";


const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { user, setSelectedChat, chats, setChats } = useContext(ChatContext);

  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInformation");
    navigate("/");
  };

  const handleSearch = async() => {

    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${user.token}`}
      };

      const { data } = await axios.get(`https://streamline-eight.herokuapp.com/auth/getUserDetails?username=${search}`, config);
      console.log(data, 'searchQuerry keyword response data');

      setLoading(false);
      setSearchResult(data.users);

    } catch (error) {

      console.log(error.message);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };


  

  const accessChatCreateChat = async (userId) => {

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`https://streamline-eight.herokuapp.com/chat`, { userId }, config);

      if (!chats.find((chat) => chat._id === data._id)) setChats([data, ...chats]); 

      setSelectedChat(data);

      console.log(data, 'access new/existing chat response data');

      setLoadingChat(false);
      onClose();
    } catch (error) {

      console.log(error.message);
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleTodo = ()=>{
    navigate("/todo")
  }

  return (
    <React.Fragment>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="1px"
        borderColor="black"
        bg="teal.600"
        color="black"
      >
      <div>
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" bg ='blue.700' onClick={onOpen} color="white"
            _hover={{ background: "purple.800" }} _active={{ background: "purple.800"}}>
              <i className="fas fa-search"></i>
              <Text display={{ base: "none", md: "flex" }} px={4} fontWeight="bold">
                Search User
              </Text>
          </Button>
        </Tooltip>
        <Button variant="ghost" bg ='blue.700' color="white" marginLeft={"10px"} onClick={handleTodo}
            _hover={{ background: "purple.800" }} _active={{ background: "purple.800"}}>
              {/* <i className="fas fa-search"></i> */}
              <Text display={{ base: "none", md: "flex" }} px={4} fontWeight="bold">
                Assign Tasks
              </Text>
        </Button>
      </div>
     

        <Text cursor="pointer" onClick={()=>{navigate("/chat")}} fontSize="3xl" fontFamily="Work sans bold" fontWeight='bold' color="gray.200" >
          Streamline
        </Text>

        <div>
          <Menu>
            <MenuButton as={Button} bg="blue.700"  rightIcon={<ChevronDownIcon/>}  
              _hover={{background: "purple.800", color:"yellow.400"}} _active={{background: "purple.800", color:"yellow.400"}}>
              <Avatar size="sm" cursor="pointer" name={user.name} borderColor="black" borderWidth="2px" bg="yellow.400" color="black"/>
            </MenuButton>
            <MenuList bg = "teal.600" borderColor="black" borderWidth="2px">
              <ProfileModal user={user}>
                <MenuItem fontWeight="bold" color="black" _hover={{background: "yellow.400"}}  >
                  My Profile
                </MenuItem>{" "}
              </ProfileModal>
              <MenuDivider/>
              <MenuItem fontWeight="bold" color="black" onClick={logoutHandler} _hover={{background: "purple.600"}}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              "spinner"
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChatCreateChat(user._id)}
                />
              ))
            )} 
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default SideDrawer;
