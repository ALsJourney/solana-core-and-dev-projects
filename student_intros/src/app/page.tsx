"use client";
import { Center, Box, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { AppBar } from "./components/AppBar";
import { StudentIntroList } from "./components/StudentIntroList";
import { Form } from "./components/Form";
import styles from "./styles/Home.module.css";
export default function Home() {
  return (
    <div className={styles.App}>
      <Head>
        <title>Student Intros</title>
      </Head>
      <AppBar />
      <Center>
        <Box>
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Introduce Yourself!
          </Heading>
          <Form />
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Meet the Students!
          </Heading>
          <StudentIntroList />
        </Box>
      </Center>
    </div>
  );
}
